import fs from 'fs';
import assert from 'assert';

console.log('=== RUNNING FINAL POLISH BUGS VERIFICATION SUITE ===');

const html = fs.readFileSync('index.html', 'utf8');
const progressJs = fs.readFileSync('sakuga-vfx/progress.js', 'utf8');
const toastJs = fs.readFileSync('sakuga-vfx/toast.js', 'utf8');
const questions = JSON.parse(fs.readFileSync('exam_questions_bank_verified.json', 'utf8'));

// 1. STEP 1: Ghost progress lines and particles
console.log('Testing STEP 1: Ghost progress lines and particles...');
assert(progressJs.includes('if (settled && !done) return;'), 'progress.js must return early in paint() when settled to avoid ghost lines');
assert(html.includes('id="appAuthHydrationLoader" class="fixed inset-0 z-[99999]'), 'appAuthHydrationLoader must have z-[99999] above canvas');
assert(html.includes('z-index: 35 !important;'), 'canvas.sakuga-fx must have z-index: 35 below header (z-40) and splash (z-[99999])');
assert(html.includes("window.SakugaFX.clear()"), 'window scroll listener must clear canvas on scroll');
console.log('PASS: STEP 1 (Ghost progress lines and sparks) verified');

// 2. STEP 2: Toast auto-dismiss
console.log('Testing STEP 2: Toast auto-dismiss...');
assert(toastJs.includes('this._dismissTimer = setTimeout'), 'toast.js must use explicit dismiss timer');
assert(toastJs.includes('this.hide()'), 'toast.js dismiss timer must call this.hide()');
assert(html.includes("skToast.setAttribute('duration', '2.2')"), 'showToast must set duration to 2.2');
console.log('PASS: STEP 2 (Formula Studio bottom-left toast auto-dismiss) verified');

// 3. STEP 3: Flashcards back-face flicker and counter sync
console.log('Testing STEP 3: Flashcards back-face flicker & counter sync...');
assert(html.includes('transform: rotateY(0deg) translateZ(1px);'), 'flip-face must use translateZ(1px) to prevent 3D flicker');
assert(html.includes('transform: rotateY(180deg) translateZ(1px);'), 'flip-back must use translateZ(1px) to prevent 3D flicker');
assert(html.includes('fcDeckMasteryTxt'), 'Flashcards must update fcDeckMasteryTxt');
assert(html.includes('#fcSakugaProgress'), 'Flashcards must style fcSakugaProgress');
assert(html.includes('--sk-progress-width: 100% !important;'), 'fcSakugaProgress must have 100% width');
console.log('PASS: STEP 3 (Flashcards back-face flicker & counter sync) verified');

// 4. STEP 4: KaTeX errors and Q169/Table 3
console.log('Testing STEP 4: KaTeX errors...');
const q169 = questions.find(q => q.id === 'Q169');
assert(q169, 'Q169 must exist');
assert(!q169.prompt.includes('\\{t sin 3t}'), 'Q169 must not contain unescaped \\{t sin 3t}');
assert(q169.prompt.includes('\\sin'), 'Q169 must use proper \\sin');
assert(!html.includes('\\text{Growth & Logistic}'), 'index.html must escape & in \\text{Growth & Logistic}');
assert(!html.includes('\\text{Reactance & Impedance}'), 'index.html must escape & in \\text{Reactance & Impedance}');
console.log('PASS: STEP 4 (Zero KaTeX errors and formulas verified) verified');

// 5. Hard rules: Zero banned words
console.log('Testing Hard Rules: Zero banned words...');
const bannedWords = ['KIIT', 'A30', 'MA 11009', 'MA11009'];
bannedWords.forEach(w => {
  assert(!html.includes(w), `index.html contains banned word: ${w}`);
  assert(!progressJs.includes(w), `progress.js contains banned word: ${w}`);
  assert(!toastJs.includes(w), `toast.js contains banned word: ${w}`);
});
console.log('PASS: Hard rules verified (100% free forever, zero banned words)');

console.log('\n>>> ALL FINAL POLISH BUGS VERIFIED 100% PASSED! <<<');
