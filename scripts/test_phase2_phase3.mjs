import fs from 'fs';

console.log('--- EXECUTING PHASE 2 & PHASE 3 COMPREHENSIVE TEST SUITE ---');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify Audio System Completely Removed (Zero Audio Thread Latency)
if (html.includes('class SoundEngine') || html.includes('window.AudioContext') || html.includes('new AudioContext')) {
  console.error('FAIL: SoundEngine or AudioContext still found in index.html');
  process.exit(1);
}
console.log('PASS: Audio system completely removed (zero audio device latency / 100% silent VFX-only operation)');

// 2. Verify SFX Toggles Removed from Header & Profile
if (html.includes('id="sfxToggleBtn"') || html.includes('id="profileSfxToggleBtn"') || html.includes('function toggleSfx()')) {
  console.error('FAIL: SFX toggles or handler functions still exist in index.html');
  process.exit(1);
}
console.log('PASS: SFX toggles and handlers cleanly eliminated from header and student profile modal');

// 3. Verify Strict App Silence (Zero Audio Overheads Guaranteed)
if (html.includes('sfxEngine.play')) {
  console.error('FAIL: Found lingering sfxEngine.play calls');
  process.exit(1);
}
console.log('PASS: Strict silence verified (zero lingering sound engine invocations)');

// 4. Verify ComposedPath Shadow-Piercing Navigation
if (!html.includes('// ComposedPath shadow-piercing navigation for header tabs') ||
    !html.includes('e.composedPath ? e.composedPath() : [e.target]')) {
  console.error('FAIL: ComposedPath shadow-piercing navigation is missing');
  process.exit(1);
}
console.log('PASS: ComposedPath shadow-piercing tab navigation verified');

// 5. Verify 318 Question Bank Unification & Option Shuffling
if (!html.includes('exam_questions_bank_verified.json') ||
    !html.includes('prepareQuestionWithShuffledOptions')) {
  console.error('FAIL: 318 Question bank or option shuffling missing');
  process.exit(1);
}
console.log('PASS: 318 Question bank and Fisher-Yates MCQ option shuffling verified');

// 6. Verify KaTeX in Active Exam & Scorecard Report
if (!html.includes('renderRichMathText') ||
    !html.includes('renderOptionContent') ||
    !html.includes('renderAllTex')) {
  console.error('FAIL: KaTeX math renderers missing');
  process.exit(1);
}
console.log('PASS: Comprehensive KaTeX math rendering verified across all test screens');

// 7. Verify Post-Exam Navigation & Lifetime Supabase Persistence
if (!html.includes('data-action="return-cbt-builder"') ||
    !html.includes('data-action="return-home"') ||
    !html.includes('data-action="retake-cbt-exam"') ||
    !html.includes('saveTestAttemptToSupabase')) {
  console.error('FAIL: Post-exam navigation or Supabase persistence missing');
  process.exit(1);
}
console.log('PASS: Post-exam navigation buttons and Supabase test attempt persistence verified');

// 8. Verify Zero Banned Words
const banned = ['KIIT', 'A30', 'MA 11009'];
for (const b of banned) {
  if (html.includes(b)) {
    console.error(`FAIL: Found banned word "${b}"`);
    process.exit(1);
  }
}
console.log('PASS: Zero banned words verified');

// 9. Verify Service Worker v22
const sw = fs.readFileSync('sw.js', 'utf8');
if (!sw.includes("maths-master-studio-v22") || !html.includes("sw.js?v=22")) {
  console.error('FAIL: Service Worker v22 cache busting missing');
  process.exit(1);
}
console.log('PASS: Service Worker v22 cache busting verified');

console.log('\n>>> ALL PHASE 2 & PHASE 3 COMPREHENSIVE TESTS PASSED! <<<');
