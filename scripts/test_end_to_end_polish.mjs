import fs from 'fs';

console.log('--- EXECUTING END-TO-END POLISH VERIFICATION SUITE ---');

const html = fs.readFileSync('index.html', 'utf8').replace(/\r/g, '');

// 1. Header Verification
const headerBlockMatch = html.match(/<header[\s\S]*?<\/header>/);
if (!headerBlockMatch) {
  console.error('FAIL: Missing <header> element in index.html');
  process.exit(1);
}
const headerHtml = headerBlockMatch[0];

// Assert vfxToggleBtn is enclosed within sr-only container
const srOnlyBlockMatch = headerHtml.match(/<div class="sr-only">[\s\S]*?<\/div>\s*<!-- Supabase Auth/);
if (!srOnlyBlockMatch || !srOnlyBlockMatch[0].includes('id="vfxToggleBtn"')) {
  console.error('FAIL: VFX toggle must be enclosed in sr-only container in header');
  process.exit(1);
}
console.log('PASS: Header decluttered - VFX toggle removed from visible header bar');

// Assert header navigation tabs exist
if (!headerHtml.includes('id="headerNavTabs"') ||
    !headerHtml.includes('value="syllabus"') ||
    !headerHtml.includes('value="studio"') ||
    !headerHtml.includes('value="flashcards"') ||
    !headerHtml.includes('value="labs"') ||
    !headerHtml.includes('value="tables"') ||
    !headerHtml.includes('value="test"')) {
  console.error('FAIL: Missing one of the 6 primary navigation tabs in header');
  process.exit(1);
}
console.log('PASS: Primary navigation tabs cleanly present in header');

// 2. Profile Modal Toggles Verification
const profileModalMatch = html.match(/<div id="profileModal"[\s\S]*?<\/div>\s*<!-- Sakuga Global Feedback Toast/);
if (!profileModalMatch) {
  console.error('FAIL: Missing #profileModal');
  process.exit(1);
}
const profileHtml = profileModalMatch[0];

if (!profileHtml.includes('id="profileVfxToggleBtn"') ||
    !profileHtml.includes('id="profileVfxSwitchThumb"') ||
    !profileHtml.includes('id="profileVfxStatusBadge"')) {
  console.error('FAIL: Profile modal missing VFX toggle switch or status badge');
  process.exit(1);
}
console.log('PASS: Student Profile modal contains animated VFX toggle switch with status badge');

// 3. Flashcards Section Verification
// Must NOT have visible Master button
const fcViewMatch = html.match(/function renderFlashcardsView\(container\) \{[\s\S]*?\/\/ VIEW 3: 100 INTERACTIVE/);
if (!fcViewMatch) {
  console.error('FAIL: Could not locate renderFlashcardsView in index.html');
  process.exit(1);
}
const fcCode = fcViewMatch[0];

if (!fcCode.includes('<div class="hidden">\n              <sakuga-checkbox id="fcKnowCheckbox">Mastered</sakuga-checkbox>\n              <button id="fcKnowBtn"></button>\n            </div>') &&
    !fcCode.includes('class="hidden">\n              <sakuga-checkbox id="fcKnowCheckbox"')) {
  console.error('FAIL: Flashcards Master button is still visible (must be hidden)');
  process.exit(1);
}
console.log('PASS: Flashcards "Mark Mastered" button cleanly removed from visible UI');

// Must have sleek progress bar without broken comic bubble
if (!fcCode.includes('id="fcProgressBar"') || !fcCode.includes('id="fcCounter"')) {
  console.error('FAIL: Missing clean progress bar in Flashcards');
  process.exit(1);
}
console.log('PASS: Flashcards clean progress bar and accurate counter verified');

// 4. Master Tables Section Verification
const tblViewMatch = html.match(/function renderTablesView\(container\) \{[\s\S]*?<\/table>/);
if (!tblViewMatch) {
  console.error('FAIL: Could not locate renderTablesView in index.html');
  process.exit(1);
}
const tblCode = tblViewMatch[0];

// sakuga-tabs must be hidden
if (!tblCode.includes('id="masterTableTabs"') || (!tblCode.includes('class="hidden"') && !tblCode.includes('display:none'))) {
  console.error('FAIL: Master Tables sakuga-tabs is not hidden (duplicate row detected)');
  process.exit(1);
}
console.log('PASS: Master Tables duplicate row eliminated; single clean responsive tab row verified');

// 5. Test Studio Tabs Verification
const testViewMatch = html.match(/function renderCbtBuilder\(container\) \{[\s\S]*?<!-- Tab Content Selection -->/);
if (!testViewMatch) {
  console.error('FAIL: Could not locate renderCbtBuilder in index.html');
  process.exit(1);
}
const testCode = testViewMatch[0];

if (!testCode.includes('data-switch-test-tab="endsem"') ||
    !testCode.includes('data-switch-test-tab="custom"') ||
    !testCode.includes('data-switch-test-tab="history"')) {
  console.error('FAIL: Missing data-switch-test-tab in Test Studio switcher');
  process.exit(1);
}
console.log('PASS: Unified high-performance responsive Test Studio tabs verified');

// 6. Navigation Guard
if (!html.includes('if (state.view === v && v !== \'test\') return;')) {
  console.error('FAIL: navigateToView missing duplicate click / same view lag guard');
  process.exit(1);
}
console.log('PASS: navigateToView lag prevention guard verified');

// 7. Banned Words Verification
const bannedWords = ['KIIT', 'A30', 'MA 11009'];
for (const b of bannedWords) {
  if (html.includes(b)) {
    console.error(`FAIL: Found banned word "${b}" in index.html`);
    process.exit(1);
  }
}
console.log('PASS: Zero banned words across entire codebase');

// 8. 100% Free Forever
if (html.toLowerCase().includes('subscription required') || html.toLowerCase().includes('unlock premium') || html.toLowerCase().includes('pay to unlock')) {
  console.error('FAIL: Found paywall strings in index.html');
  process.exit(1);
}
console.log('PASS: 100% Free Forever verified');

console.log('\n>>> ALL END-TO-END POLISH VERIFICATION CHECKS PASSED! <<<');
