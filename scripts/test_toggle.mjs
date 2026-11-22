import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Test 1: Header switch
if (!html.includes('id="vfxToggleBtn"') || !html.includes('id="vfxSwitchTrack"') || !html.includes('id="vfxSwitchThumb"')) {
  console.error('FAIL: Missing header toggle switch elements');
  process.exit(1);
}
console.log('PASS: Header toggle switch elements verified');

// Test 2: Mobile responsive header
if (!html.includes('hidden sm:block text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate')) {
  console.error('FAIL: Subtitle not hidden on mobile screens');
  process.exit(1);
}
console.log('PASS: Mobile header space optimization verified');

// Test 3: Profile modal toggle
if (!html.includes('id="profileVfxToggleBtn"') || !html.includes('id="profileVfxSwitchThumb"')) {
  console.error('FAIL: Missing profile modal toggle switch');
  process.exit(1);
}
console.log('PASS: Student profile modal toggle switch verified');

// Test 4: Custom quiz mode toggle
if (!html.includes('data-set-custom-mode="practice"') || !html.includes('● ACTIVE')) {
  console.error('FAIL: Custom quiz mode active toggle indicator missing');
  process.exit(1);
}
console.log('PASS: Custom quiz mode toggle indicator verified');

// Test 5: Banned words
const banned = ['KIIT', 'A30', 'MA 11009'];
for (const b of banned) {
  if (html.includes(b)) {
    console.error('FAIL: Found banned word ' + b);
    process.exit(1);
  }
}
console.log('PASS: Zero banned words');
console.log('>>> ALL TOGGLE VERIFICATION CHECKS PASSED! <<<');
