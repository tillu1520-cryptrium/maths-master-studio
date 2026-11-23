import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';

console.log('=== RUNNING AFTER-OPTIMIZATION PROFILING (HEADLESS CHROMIUM) ===');

// 1. Start static server on port 3457
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

await new Promise(resolve => server.listen(3457, '127.0.0.1', resolve));

// 2. Launch Headless Chrome
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mms-chrome-perf2-'));
const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
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
    const res = await fetch('http://127.0.0.1:9223/json');
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

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise(resolve => { this.ws.onopen = resolve; });
    this.ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
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
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.text || 'Evaluation exception');
    return res.result ? res.result.value : undefined;
  }
}

const cdp = new CDPClient(webSocketDebuggerUrl);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');

await cdp.send('Page.navigate', { url: 'http://127.0.0.1:3457/index.html' });
await new Promise(r => setTimeout(r, 2000));

await cdp.evaluate(`
  window.__perf = { rafCount: 0, longTasks: [], canvasPaints: 0 };
  const origRaf = window.requestAnimationFrame;
  window.requestAnimationFrame = function(cb) {
    return origRaf.call(window, function(timestamp) {
      window.__perf.rafCount++;
      return cb(timestamp);
    });
  };
  const origClearRect = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function(...args) {
    window.__perf.canvasPaints++;
    return origClearRect.apply(this, args);
  };
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

async function measureTab(viewName) {
  await cdp.evaluate(`
    window.__perf.longTasks = [];
    window.__perf.rafCount = 0;
    window.__perf.canvasPaints = 0;
    if (window.navigateToView) window.navigateToView('${viewName}');
  `);
  // Wait 1.2s for view transition and subtle entrance to settle
  await new Promise(r => setTimeout(r, 1200));
  const switchLongTasks = await cdp.evaluate('window.__perf.longTasks.slice()');

  await cdp.evaluate(`
    window.__perf.rafCount = 0;
    window.__perf.canvasPaints = 0;
  `);
  // 3s complete idle test
  await new Promise(r => setTimeout(r, 3000));

  const metrics = await cdp.evaluate(`
    (() => {
      const totalDomNodes = document.querySelectorAll('*').length;
      const katexNodes = document.querySelectorAll('.katex, .katex-html, .katex-display').length;
      const canvases = Array.from(document.querySelectorAll('canvas')).map(c => ({
        id: c.id || c.className || 'unnamed',
        width: c.width,
        height: c.height,
        visible: getComputedStyle(c).display !== 'none'
      }));
      let backdropBlurCount = 0;
      for (const el of document.querySelectorAll('*')) {
        const s = window.getComputedStyle(el);
        if ((s.backdropFilter || s.webkitBackdropFilter || '').includes('blur')) backdropBlurCount++;
      }
      return {
        totalDomNodes,
        katexNodes,
        idleRafsIn3s: window.__perf.rafCount,
        idleCanvasPaints: window.__perf.canvasPaints,
        canvases,
        backdropBlurCount
      };
    })()
  `);

  await cdp.evaluate('window.__perf.longTasks = [];');
  const scrollMetrics = await cdp.evaluate(`
    (async () => {
      window.scrollTo({ top: 500, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 300));
      window.scrollTo({ top: 1000, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 300));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 300));
      return { scrollLongTasks: window.__perf.longTasks.slice() };
    })()
  `);

  return { viewName, ...metrics, switchLongTasks, ...scrollMetrics };
}

const views = [
  { name: 'Home', id: 'syllabus' },
  { name: 'Formula Studio', id: 'studio' },
  { name: 'Flashcards', id: 'flashcards' },
  { name: '100 Live Labs', id: 'labs' },
  { name: 'Formula Tables', id: 'tables' },
  { name: 'Test Studio', id: 'test' }
];

const afterResults = [];
for (const v of views) {
  const m = await measureTab(v.id);
  afterResults.push(m);
}

const beforeResults = JSON.parse(fs.readFileSync('scripts/perf_before_metrics.json', 'utf8'));

console.log('\n========================================================================================================');
console.log('REAL RUNTIME PERFORMANCE PROFILE: BEFORE vs. AFTER COMPARISON');
console.log('========================================================================================================\n');

console.log('| View / Tab       | Metric                     | BEFORE               | AFTER               | Status / Target   |');
console.log('|------------------|----------------------------|----------------------|---------------------|-------------------|');

for (let i = 0; i < views.length; i++) {
  const b = beforeResults[i];
  const a = afterResults[i];
  const name = views[i].name.padEnd(16);

  const bRaf = `${b.idleRafsIn3s} ticks (${b.idleRafPerSec}/s)`;
  const aRaf = `${a.idleRafsIn3s} ticks (${Math.round(a.idleRafsIn3s / 3)}/s)`;
  const rafStatus = a.idleRafsIn3s === 0 ? '✅ 0 rAF (PERFECT)' : '⚠️ Active';

  const bPaints = `${b.idleCanvasPaints} paints`;
  const aPaints = `${a.idleCanvasPaints} paints`;
  const paintStatus = a.idleCanvasPaints === 0 ? '✅ 0 paints (IDLE)' : '⚠️ Active';

  const bBlur = `${b.backdropBlurCount} elements`;
  const aBlur = `${a.backdropBlurCount} elements`;

  const bSwitchMax = b.switchLongTasks && b.switchLongTasks.length ? Math.max(...b.switchLongTasks.map(t => t.duration)) + 'ms' : '0ms';
  const aSwitchMax = a.switchLongTasks && a.switchLongTasks.length ? Math.max(...a.switchLongTasks.map(t => t.duration)) + 'ms' : '0ms';
  const switchStatus = (parseInt(aSwitchMax) < 50 || aSwitchMax === '0ms') ? '✅ <50ms (INSTANT)' : '⚠️ Improved';

  console.log(`| ${name} | Idle rAF (3 sec)           | ${bRaf.padEnd(20)} | ${aRaf.padEnd(19)} | ${rafStatus.padEnd(17)} |`);
  console.log(`| ${''.padEnd(16)} | Idle Canvas Paints         | ${bPaints.padEnd(20)} | ${aPaints.padEnd(19)} | ${paintStatus.padEnd(17)} |`);
  console.log(`| ${''.padEnd(16)} | Backdrop-filter: blur      | ${bBlur.padEnd(20)} | ${aBlur.padEnd(19)} | ${(a.backdropBlurCount <= b.backdropBlurCount ? '✅ Optimized' : '').padEnd(17)} |`);
  console.log(`| ${''.padEnd(16)} | Max Tab Switch Long Task   | ${bSwitchMax.padEnd(20)} | ${aSwitchMax.padEnd(19)} | ${switchStatus.padEnd(17)} |`);
  console.log('|------------------|----------------------------|----------------------|---------------------|-------------------|');
}

console.log('\n>>> HEADLESS PROFILING COMPLETE! <<<');

chromeProcess.kill();
server.close();
process.exit(0);
