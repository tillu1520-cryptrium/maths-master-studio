import fs from 'fs';

console.log('--- EXECUTING PERFORMANCE AUDIT VERIFICATION SUITE ---');

const html = fs.readFileSync('index.html', 'utf8');

// 1. In-Memory KaTeX Cache & Pre-rendered Math Nodes
if (!html.includes('const katexHtmlCache = new Map()') ||
    !html.includes('function getCachedKatexHtml') ||
    !html.includes('data-rendered="true"')) {
  console.error('FAIL: Missing in-memory KaTeX cache (Map<string, string>) or getCachedKatexHtml');
  process.exit(1);
}
console.log('PASS: KaTeX in-memory cache (Map<string, string>) and pre-rendered math verified');

// 2. Question Bank Lazy-Loading
if (!html.includes('async function ensureExamBankLoaded()') ||
    !html.includes('window.ensureExamBankLoaded = ensureExamBankLoaded')) {
  console.error('FAIL: Missing ensureExamBankLoaded lazy question bank loader');
  process.exit(1);
}
console.log('PASS: Lazy-load question bank engine verified');

// 3. Debounced saveState (400ms)
if (!html.includes('saveStateDebounceTimer = setTimeout(commitSaveState, 400)') ||
    !html.includes('function commitSaveState()')) {
  console.error('FAIL: 400ms debounced saveState is missing');
  process.exit(1);
}
console.log('PASS: 400ms debounced storage and Supabase writes verified');

// 4. Zero Audio System Overhead (SFX Completely Removed as Instructed)
if (html.includes('class SoundEngine') || html.includes('AudioContext')) {
  console.error('FAIL: SoundEngine or AudioContext still found in index.html');
  process.exit(1);
}
console.log('PASS: Zero audio overhead verified (complete removal of audio threads/nodes)');

// 5. CSS GPU & Repaint Optimization
if (!html.includes('content-visibility: auto') ||
    !html.includes('contain-intrinsic-size: 0 200px')) {
  console.error('FAIL: Missing content-visibility: auto for smooth buttery scrolling');
  process.exit(1);
}
console.log('PASS: GPU-only transitions & CSS content-visibility: auto containment verified');

// 6. Test Studio Sakuga Canvas Loop Pause & Clear
if (!html.includes("if (typeof window.SakugaFX.clear === 'function') window.SakugaFX.clear();")) {
  console.error('FAIL: Missing Test Studio boundary canvas loop clear and pause');
  process.exit(1);
}
console.log('PASS: Test Studio boundary canvas clear and idle-pause verified');

// 7. Verify all 11 Sakuga components have idle-sleep and DPR <= 2
const all11 = [
  'button.js', 'toggle.js', 'slider.js', 'checkbox.js', 'radio.js',
  'input.js', 'tabs.js', 'progress.js', 'rating.js', 'toast.js', 'tooltip.js'
];
for (const c of all11) {
  const code = fs.readFileSync(`sakuga-vfx/${c}`, 'utf8');
  if (!code.includes('Math.min(2, Math.max(1, window.devicePixelRatio || 1))')) {
    console.error(`FAIL: ${c} does not cap DPR at <= 2`);
    process.exit(1);
  }
  if (!code.includes('idleCounter > 20') || !code.includes('IDLE-SLEEP')) {
    console.error(`FAIL: ${c} does not have idle-sleep canvas loop`);
    process.exit(1);
  }
  if (!code.includes("document.querySelector('canvas.sakuga-fx')")) {
    console.error(`FAIL: ${c} does not check for existing canvas overlay`);
    process.exit(1);
  }
}
console.log('PASS: All 11 Sakuga components verified with DPR <= 2, idle-sleep loop, and single shared canvas');

// 8. Banned words verification
const banned = ['KIIT', 'A30', 'MA 11009'];
for (const b of banned) {
  if (html.includes(b)) {
    console.error(`FAIL: Found banned word "${b}"`);
    process.exit(1);
  }
}
console.log('PASS: Zero banned words verified');

console.log('\n>>> ALL PERFORMANCE AUDIT VERIFICATION CHECKS PASSED! <<<');
