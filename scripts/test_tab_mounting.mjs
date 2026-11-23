import fs from 'fs';
import vm from 'vm';

const rawHtml = fs.readFileSync('index.html', 'utf8');
const html = rawHtml.replace('function renderApp() {', 'function renderApp() { \n window.__state = state; \n');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const scripts = [];
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  if (m[1].trim()) scripts.push(m[1]);
}

class FakeClassList {
  constructor() { this.classes = new Set(); }
  add(...c) { c.forEach(x => this.classes.add(x)); }
  remove(...c) { c.forEach(x => this.classes.delete(x)); }
  toggle(c, force) {
    if (force === true) this.classes.add(c);
    else if (force === false) this.classes.delete(c);
    else if (this.classes.has(c)) this.classes.delete(c);
    else this.classes.add(c);
  }
  contains(c) { return this.classes.has(c); }
}

function makeElement(tag) {
  const el = {
    tagName: tag.toUpperCase(),
    classList: new FakeClassList(),
    style: {},
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] ?? null; },
    removeAttribute(k) { delete this.attributes[k]; },
    hasAttribute(k) { return k in this.attributes; },
    children: [],
    appendChild(c) { if (c) { this.children.push(c); c.parentElement = this; } return c; },
    prepend(c) { if (c) { this.children.unshift(c); c.parentElement = this; } },
    prependChild(c) { this.prepend(c); },
    addEventListener() {},
    removeEventListener() {},
    querySelector(sel) { return null; },
    querySelectorAll(sel) { return []; },
    innerHTML: '',
    textContent: '',
    dataset: {},
    parentElement: null,
    isConnected: true,
    focus() {},
    setSelectionRange() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 300, height: 100, bottom: 100, right: 300 }; },
    getContext() {
      return {
        clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
        save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, setTransform() {},
        arc() {}, quadraticCurveTo() {}, bezierCurveTo() {}, closePath() {}
      };
    }
  };
  return el;
}

const dom = {
  elements: {},
  createElement: makeElement,
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = makeElement('div');
      this.elements[id].id = id;
    }
    return this.elements[id];
  },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  body: makeElement('body'),
  documentElement: makeElement('html'),
  addEventListener() {},
  removeEventListener() {}
};

const sandbox = {
  window: {},
  document: dom,
  console: {
    log: () => {},
    warn: console.warn,
    error: console.error,
    info: console.info
  },
  setTimeout: (fn) => { if (typeof fn === 'function') fn(); },
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  history: { pushState: () => {}, replaceState: () => {} },
  location: { hash: '' },
  navigator: { userAgent: 'test' },
  CustomEvent: function(type, opts) { this.type = type; this.detail = opts && opts.detail; },
  Event: function(type) { this.type = type; },
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  innerHeight: 800,
  innerWidth: 1200,
  scrollX: 0,
  scrollY: 0,
  tailwind: {},
  katex: { renderToString: (tex) => `<span class="katex">${tex}</span>` },
  lucide: { createIcons: () => {} },
  Math, Date, JSON, parseInt, parseFloat, isNaN, isFinite, RegExp, Array, Object, String, Number, Boolean, Map, Set, Error
};
sandbox.window = sandbox;
sandbox.global = sandbox;
sandbox.globalThis = sandbox;

const ctx = vm.createContext(sandbox);
for (let i = 0; i < scripts.length; i++) {
  vm.runInContext(scripts[i], ctx, { filename: `script-${i}` });
}

console.log('--- TESTING ALL 6 VIEWS MOUNTING & ROUTING ---');
const views = ['syllabus', 'studio', 'flashcards', 'labs', 'tables', 'test', 'syllabus'];
let allPassed = true;
for (const v of views) {
  sandbox.navigateToView(v);
  const current = sandbox.__state ? sandbox.__state.view : null;
  if (current === v) {
    console.log(`PASS: Navigated to '${v}' successfully (state.view = ${current})`);
  } else {
    console.error(`FAIL: Tried navigating to '${v}' but state.view is '${current}'`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('>>> ALL VIEWS SWITCH CLEANLY WITH ZERO CRASHES! <<<');
} else {
  process.exit(1);
}
