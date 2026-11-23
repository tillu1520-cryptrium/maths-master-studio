import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';

// 1. Start static server on port 3456
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

await new Promise(resolve => server.listen(3456, '127.0.0.1', resolve));
console.log('Local static server running at http://127.0.0.1:3456');

// 2. Launch Headless Chrome
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mms-chrome-perf-'));
const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=1280,800',
  '--user-data-dir=' + userDataDir,
  'about:blank'
], { stdio: 'ignore' });

// Wait for Chrome remote debugging to respond
let webSocketDebuggerUrl = null;
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 200));
  try {
    const res = await fetch('http://127.0.0.1:9222/json');
    const tabs = await res.json();
    if (tabs && tabs.length > 0 && tabs[0].webSocketDebuggerUrl) {
      webSocketDebuggerUrl = tabs[0].webSocketDebuggerUrl;
      break;
    }
  } catch (e) {}
}

if (!webSocketDebuggerUrl) {
  console.error('Failed to connect to headless Chrome');
  chromeProcess.kill();
  server.close();
  process.exit(1);
}

console.log('Connected to Headless Chrome via CDP:', webSocketDebuggerUrl);

// CDP helper class
class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.ready = new Promise(resolve => {
      this.ws.onopen = resolve;
    });
    this.ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      } else if (data.method) {
        this.events.push(data);
      }
    };
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Evaluation exception');
    }
    return res.result ? res.result.value : undefined;
  }
}

const cdp = new CDPClient(webSocketDebuggerUrl);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');

// Navigate to app
await cdp.send('Page.navigate', { url: 'http://127.0.0.1:3456/index.html' });
await new Promise(r => setTimeout(r, 2000));

// Inject instrumentations into the page
await cdp.evaluate(`
  window.__perf = {
    rafCount: 0,
    activeLoops: 0,
    longTasks: [],
    canvasPaints: 0
  };

  // 1. Hook requestAnimationFrame to track frames
  const origRaf = window.requestAnimationFrame;
  window.requestAnimationFrame = function(cb) {
    window.__perf.activeLoops++;
    return origRaf.call(window, function(timestamp) {
      window.__perf.rafCount++;
      return cb(timestamp);
    });
  };

  // 2. Hook Canvas 2D paints
  const origClearRect = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function(...args) {
    window.__perf.canvasPaints++;
    return origClearRect.apply(this, args);
  };

  // 3. PerformanceObserver for Long Tasks (>50ms)
  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__perf.longTasks.push({
          name: entry.name,
          duration: Math.round(entry.duration),
          startTime: Math.round(entry.startTime)
        });
      }
    });
    po.observe({ entryTypes: ['longtask'] });
  } catch(e) {}
`);

console.log('Performance instrumentation installed in browser context.');

// Measure function for each tab
async function measureTab(viewName, tabHash) {
  console.log('\n>>> Profiling tab: ' + viewName + ' (' + tabHash + ') <<<');
  
  // Switch tab and record long tasks during switch
  await cdp.evaluate(`
    window.__perf.longTasks = [];
    window.__perf.rafCount = 0;
    window.__perf.canvasPaints = 0;
    if (window.navigateToView) window.navigateToView('${viewName}');
  `);
  
  // Wait 600ms for transition
  await new Promise(r => setTimeout(r, 600));
  const switchLongTasks = await cdp.evaluate('window.__perf.longTasks.slice()');
  
  // Reset counters for 3s IDLE test
  await cdp.evaluate(`
    window.__perf.rafCount = 0;
    window.__perf.canvasPaints = 0;
  `);
  
  console.log('Measuring 3 seconds of complete idle...');
  await new Promise(r => setTimeout(r, 3000));
  
  // Collect all data
  const metrics = await cdp.evaluate(`
    (() => {
      const totalDomNodes = document.querySelectorAll('*').length;
      const katexNodes = document.querySelectorAll('.katex, .katex-html, .katex-display').length;
      
      // Canvases
      const canvases = Array.from(document.querySelectorAll('canvas')).map(c => ({
        id: c.id || c.className || 'unnamed',
        width: c.width,
        height: c.height,
        displayWidth: c.offsetWidth,
        displayHeight: c.offsetHeight,
        visible: getComputedStyle(c).display !== 'none' && getComputedStyle(c).visibility !== 'hidden'
      }));

      // Expensive CSS audit
      const allEls = Array.from(document.querySelectorAll('*'));
      let backdropBlurCount = 0;
      let dropShadowCount = 0;
      let heavyShadowCount = 0;
      let willChangeTransformCount = 0;

      for (const el of allEls) {
        const style = window.getComputedStyle(el);
        const bf = style.backdropFilter || style.webkitBackdropFilter || '';
        if (bf.includes('blur')) backdropBlurCount++;
        
        const f = style.filter || '';
        if (f.includes('drop-shadow')) dropShadowCount++;
        
        const bs = style.boxShadow || '';
        if (bs && bs !== 'none' && bs.length > 30) heavyShadowCount++;

        const wc = style.willChange || '';
        if (wc.includes('transform')) willChangeTransformCount++;
      }

      return {
        totalDomNodes,
        katexNodes,
        idleRafsIn3s: window.__perf.rafCount,
        idleRafPerSec: Math.round(window.__perf.rafCount / 3),
        idleCanvasPaints: window.__perf.canvasPaints,
        canvases,
        backdropBlurCount,
        dropShadowCount,
        heavyShadowCount,
        willChangeTransformCount
      };
    })()
  `);

  // Scroll test: measure Long tasks during scroll
  await cdp.evaluate('window.__perf.longTasks = [];');
  const scrollMetrics = await cdp.evaluate(`
    (async () => {
      window.scrollTo({ top: 500, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 300));
      window.scrollTo({ top: 1000, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 300));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 300));

      return {
        scrollLongTasks: window.__perf.longTasks.slice()
      };
    })()
  `);

  return {
    viewName,
    ...metrics,
    switchLongTasks,
    ...scrollMetrics
  };
}

const views = [
  { name: 'Home', hash: '#home', id: 'syllabus' },
  { name: 'Formula Studio', hash: '#studio', id: 'studio' },
  { name: 'Flashcards', hash: '#flashcards', id: 'flashcards' },
  { name: '100 Live Labs', hash: '#labs', id: 'labs' },
  { name: 'Formula Tables', hash: '#tables', id: 'tables' },
  { name: 'Test Studio', hash: '#test', id: 'test' }
];

const results = [];
for (const v of views) {
  const m = await measureTab(v.id, v.hash);
  results.push(m);
}

console.log('\n========================================================================================');
console.log('PROFILING RESULTS (BEFORE FIXES)');
console.log('========================================================================================');

for (const r of results) {
  console.log(`
TAB: ${r.viewName.toUpperCase()}
  - DOM Nodes: ${r.totalDomNodes} (KaTeX Nodes: ${r.katexNodes})
  - Idle rAF Ticks (3 sec): ${r.idleRafsIn3s} (${r.idleRafPerSec} rAF/sec while IDLE! Target: 0)
  - Idle Canvas Paints (3 sec): ${r.idleCanvasPaints}
  - Canvases: ${JSON.stringify(r.canvases)}
  - Expensive CSS:
      backdrop-filter: blur: ${r.backdropBlurCount} elements
      filter: drop-shadow: ${r.dropShadowCount} elements
      heavy box-shadow: ${r.heavyShadowCount} elements
      will-change: transform: ${r.willChangeTransformCount} elements
  - Tab Switch Long Tasks (>50ms): ${JSON.stringify(r.switchLongTasks)}
  - Scroll Long Tasks (>50ms): ${JSON.stringify(r.scrollLongTasks)}
  `);
}

// Save before metrics to file
fs.writeFileSync('scripts/perf_before_metrics.json', JSON.stringify(results, null, 2));

// Cleanup
chromeProcess.kill();
server.close();
process.exit(0);
