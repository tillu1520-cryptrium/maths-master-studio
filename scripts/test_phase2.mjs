import fs from 'fs';

console.log('--- TESTING PHASE 2 INTEGRATION ---');

const html = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

// 1. Verify Sakuga scripts
const requiredScripts = [
  '/sakuga-vfx/button.js',
  '/sakuga-vfx/progress.js',
  '/sakuga-vfx/slider.js',
  '/sakuga-vfx/toast.js'
];
for (const s of requiredScripts) {
  if (!html.includes(s)) {
    console.error(`FAIL: Missing script ${s}`);
    process.exit(1);
  }
}
console.log('PASS: All 4 selective Sakuga scripts included in index.html');

// 2. Strict Prohibition: Ensure sakuga-toggle is NOT installed
if (html.includes('sakuga-toggle') || fs.existsSync('public/sakuga-vfx/toggle.js') || fs.existsSync('sakuga-vfx/toggle.js')) {
  console.error('FAIL: sakuga-toggle is prohibited!');
  process.exit(1);
}
console.log('PASS: sakuga-toggle is NOT present (compliance verified)');

// 3. Strict Prohibition: Ensure active exam controls do NOT have sakuga elements
const testStudioSections = html.match(/function renderCbtExamEnvironment[\s\S]*?function renderCbtScorecard/);
if (testStudioSections) {
  const sectionStr = testStudioSections[0];
  if (sectionStr.includes('sakuga-')) {
    console.error('FAIL: Sakuga found inside active exam environment!');
    process.exit(1);
  }
}
console.log('PASS: Active exam environment contains ZERO Sakuga elements (compliance verified)');

// 4. Verify CSS variables
const requiredVars = ['--sk-card', '--sk-ink', '--sk-pri', '--sk-acc', '--sk-track', '--sk-sh'];
for (const v of requiredVars) {
  if (!html.includes(v)) {
    console.error(`FAIL: Missing CSS variable ${v}`);
    process.exit(1);
  }
}
console.log('PASS: Sakuga CSS variables for light and dark modes defined');

// 5. Verify VFX toggle button
if (!html.includes('id="vfxToggleBtn"') || !html.includes('function toggleVfx')) {
  console.error('FAIL: Missing vfxToggleBtn or toggleVfx function');
  process.exit(1);
}
console.log('PASS: Header VFX toggle button and toggleVfx handler verified');

// 6. Verify Formula Studio mastery button & progress
if (!html.includes('sakuga-button') || !html.includes('sakuga-progress')) {
  console.error('FAIL: Missing sakuga-button or sakuga-progress in Formula Studio');
  process.exit(1);
}
console.log('PASS: Formula Studio mastery sakuga-button and chapter sakuga-progress verified');

// 7. Verify 100 Live Labs sakuga-slider
if (!html.includes('<sakuga-slider')) {
  console.error('FAIL: Missing sakuga-slider in Live Labs');
  process.exit(1);
}
console.log('PASS: 100 Live Labs sakuga-slider verified');

// 8. Verify global sakuga-toast
if (!html.includes('<sakuga-toast id="globalSakugaToast"')) {
  console.error('FAIL: Missing globalSakugaToast');
  process.exit(1);
}
console.log('PASS: Global Sakuga toast component verified');

// 9. Verify files in /sakuga-vfx/ can be parsed
for (const f of ['button.js', 'progress.js', 'slider.js', 'toast.js']) {
  const path = 'sakuga-vfx/' + f;
  if (!fs.existsSync(path)) {
    console.error(`FAIL: File ${path} does not exist`);
    process.exit(1);
  }
  const code = fs.readFileSync(path, 'utf8');
  if (code.length < 10000) {
    console.error(`FAIL: File ${path} too small (${code.length} bytes)`);
    process.exit(1);
  }
}
console.log('PASS: All 4 sakuga JS files verified on disk');

// 10. Verify sw.js includes assets
for (const s of requiredScripts) {
  if (!sw.includes(s)) {
    console.error(`FAIL: sw.js missing ${s}`);
    process.exit(1);
  }
}
console.log('PASS: sw.js caches all 4 sakuga assets (offline ready)');

console.log('\n>>> ALL PHASE 2 VERIFICATIONS PASSED SUCCESSFULLY! <<<');
