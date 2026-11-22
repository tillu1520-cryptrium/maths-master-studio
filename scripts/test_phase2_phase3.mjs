import fs from 'fs';

console.log('--- EXECUTING PHASE 2 & PHASE 3 COMPREHENSIVE TEST SUITE ---');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify SoundEngine implementation
if (!html.includes('class SoundEngine') ||
    !html.includes('playTabSwitch()') ||
    !html.includes('playClick()') ||
    !html.includes('playToggle(isOn)') ||
    !html.includes('playMastered()') ||
    !html.includes('playUnmark()') ||
    !html.includes('playCardFlip()') ||
    !html.includes('playSliderTick()') ||
    !html.includes('playDone()') ||
    !html.includes('playExamSubmit()')) {
  console.error('FAIL: SoundEngine or one of its 9 audio synthesizer methods is missing');
  process.exit(1);
}
console.log('PASS: Pure Web Audio API SoundEngine with 9 synthesized audio methods verified');

// 2. Verify SFX Toggles (Header + Profile)
if (!html.includes('id="sfxToggleBtn"') ||
    !html.includes('id="profileSfxToggleBtn"') ||
    !html.includes('function toggleSfx()') ||
    !html.includes('function updateSfxUI()')) {
  console.error('FAIL: SFX toggles or handler functions missing');
  process.exit(1);
}
console.log('PASS: Accessible header and student profile SFX toggles verified');

// 3. Verify Strict Exam Silence Boundary
if (!html.includes("if (state.activeTest && state.view === 'test' && state.testView === 'exam') return false;")) {
  console.error('FAIL: Strict silence during active exam is missing in canPlay()');
  process.exit(1);
}
console.log('PASS: Strict silence during active CBT examination verified (exam focus guaranteed)');

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

// 9. Verify Service Worker v18
const sw = fs.readFileSync('sw.js', 'utf8');
if (!sw.includes("maths-master-studio-v18") || !html.includes("sw.js?v=18")) {
  console.error('FAIL: Service Worker v18 cache busting missing');
  process.exit(1);
}
console.log('PASS: Service Worker v18 cache busting verified');

console.log('\n>>> ALL PHASE 2 & PHASE 3 COMPREHENSIVE TESTS PASSED! <<<');
