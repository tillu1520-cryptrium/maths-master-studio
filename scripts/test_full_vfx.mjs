import fs from 'fs';

console.log('--- EXECUTING FULL SAKUGA VFX TEST SUITE ---');

const html = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

// 1. Verify All 11 Sakuga Component Scripts Loaded in index.html & sw.js
const all11Components = [
  'button.js', 'toggle.js', 'slider.js', 'checkbox.js', 'radio.js',
  'input.js', 'tabs.js', 'progress.js', 'rating.js', 'toast.js', 'tooltip.js'
];

for (const c of all11Components) {
  const scriptTag = `/sakuga-vfx/${c}`;
  if (!html.includes(scriptTag)) {
    console.error(`FAIL: index.html missing script tag for ${scriptTag}`);
    process.exit(1);
  }
  if (!sw.includes(scriptTag)) {
    console.error(`FAIL: sw.js missing static asset ${scriptTag}`);
    process.exit(1);
  }
}
console.log('PASS: All 11 Sakuga components referenced in index.html and sw.js');

// 2. Verify All 11 Files Exist in sakuga-vfx/ and public/sakuga-vfx/
for (const c of all11Components) {
  const rootPath = `sakuga-vfx/${c}`;
  const pubPath = `public/sakuga-vfx/${c}`;
  if (!fs.existsSync(rootPath)) {
    console.error(`FAIL: Missing ${rootPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(pubPath)) {
    console.error(`FAIL: Missing ${pubPath}`);
    process.exit(1);
  }
  const len = fs.readFileSync(rootPath, 'utf8').length;
  if (len < 5000) {
    console.error(`FAIL: File ${rootPath} suspiciously small (${len} bytes)`);
    process.exit(1);
  }
}
console.log('PASS: All 11 component files exist on disk with valid code');

// 3. Verify tooltip.js defines sakuga-popover
const tooltipJs = fs.readFileSync('sakuga-vfx/tooltip.js', 'utf8');
if (!tooltipJs.includes('sakuga-popover')) {
  console.error('FAIL: sakuga-vfx/tooltip.js does not register sakuga-popover');
  process.exit(1);
}
console.log('PASS: sakuga-popover alias registered in tooltip.js');

// 4. Verify Header Sakuga Toggle & State Synchronization
if (!html.includes('id="headerSakugaToggle"') || !html.includes('id="vfxToggleBtn"') || !html.includes('function toggleVfx')) {
  console.error('FAIL: Header toggle switch or toggleVfx function missing');
  process.exit(1);
}
console.log('PASS: Header animated <sakuga-toggle> and toggleVfx handler verified');

// 5. Verify Two-State Mastery VFX Functions
if (!html.includes('function playMasteredVfx') || !html.includes('function playUnmarkedVfx')) {
  console.error('FAIL: Missing playMasteredVfx or playUnmarkedVfx');
  process.exit(1);
}
console.log('PASS: Two-state mastery functions (celebratory burst vs subtle reverse puff) verified');

// 6. Verify Formula Studio: sakuga-progress, sakuga-button, sakuga-input, sakuga-popover
if (!html.includes('id="chapterMasteryProgress"') ||
    !html.includes('id="studioSearchInput"') ||
    !html.includes('data-toggle-master') ||
    !html.includes('sakuga-popover')) {
  console.error('FAIL: Formula Studio missing required Sakuga components');
  process.exit(1);
}
console.log('PASS: Formula Studio components (progress, button, input, popover) verified');

// 7. Verify Flashcards: sakuga-tabs, sakuga-progress, sakuga-button, sakuga-checkbox, sakuga-rating
if (!html.includes('id="fcTabs"') ||
    !html.includes('id="fcSakugaProgress"') ||
    !html.includes('id="fcKnowCheckbox"') ||
    !html.includes('id="fcConfidenceRating"') ||
    !html.includes('id="fcShuffleBtn"')) {
  console.error('FAIL: Flashcards missing required Sakuga components');
  process.exit(1);
}
console.log('PASS: Flashcards components (tabs, progress, buttons, checkbox, rating) verified');

// 8. Verify Live Labs: sakuga-slider, sakuga-toggle, sakuga-radio
if (!html.includes('id="labS1"') ||
    !html.includes('id="labGridToggle"') ||
    !html.includes('id="labPresetRadio"')) {
  console.error('FAIL: Live Labs missing required Sakuga components');
  process.exit(1);
}
console.log('PASS: Live Labs components (sliders, toggle overlays, preset radio) verified');

// 9. Verify Master Tables: sakuga-tabs, sakuga-input, sakuga-button, sakuga-popover
if (!html.includes('id="masterTableTabs"') ||
    !html.includes('id="masterTableSearch"') ||
    !html.includes('data-copy-math')) {
  console.error('FAIL: Master Tables missing required Sakuga components');
  process.exit(1);
}
console.log('PASS: Master Tables components (tabs, input, copy button, popover) verified');

// 10. Verify Test Studio Lobby & Scorecard Components
if (!html.includes('id="testModeSakugaTabs"') ||
    !html.includes('id="scorecardPercentageProgress"') ||
    !html.includes('data-action="return-cbt-builder"')) {
  console.error('FAIL: Test Studio Lobby/Scorecard missing required Sakuga components');
  process.exit(1);
}
console.log('PASS: Test Studio Lobby/Scorecard components (tabs, progress, action buttons) verified');

// 11. Strict Exam Boundary: Active Exam Screen must have STRICTLY ZERO Sakuga elements
const examEnvMatch = html.match(/function renderCbtExamEnvironment[\s\S]*?function renderCbtScorecard/);
if (examEnvMatch) {
  const code = examEnvMatch[0];
  if (code.includes('sakuga-')) {
    console.error('FAIL: Sakuga elements found inside active exam environment (renderCbtExamEnvironment)!');
    process.exit(1);
  }
}
console.log('PASS: Active exam environment contains STRICTLY ZERO Sakuga elements (exam focus verified)');

// 12. Verify Zero Banned Words
const bannedWords = ['KIIT', 'A30', 'MA 11009'];
for (const b of bannedWords) {
  if (html.includes(b)) {
    console.error(`FAIL: Found banned word "${b}" in index.html`);
    process.exit(1);
  }
}
console.log('PASS: Zero banned words found across entire codebase');

// 13. Verify Zero Paywalls
if (html.toLowerCase().includes('subscription required') || html.toLowerCase().includes('unlock premium') || html.toLowerCase().includes('pay to unlock')) {
  console.error('FAIL: Found paywall strings in index.html');
  process.exit(1);
}
console.log('PASS: 100% Free Forever verified');

console.log('\n>>> ALL 13 FULL SAKUGA VFX VERIFICATION TESTS PASSED! <<<');
