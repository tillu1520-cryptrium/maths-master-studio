import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  { name: 'Hydration loader exists', test: html.includes('id="appAuthHydrationLoader"') },
  { name: 'App container wrapper exists', test: html.includes('id="appContainer"') && (html.includes('</footer>\n  </div>') || html.includes('</footer>\r\n  </div>')) },
  { name: 'Mandatory auth gate in openAuthModal', test: html.includes("m.dataset.mandatory = isMandatory ? 'true' : 'false'") },
  { name: 'App container blur in openAuthModal', test: html.includes("appContainer.style.filter = 'blur(12px)'") },
  { name: 'Close button hidden when mandatory', test: html.includes("closeBtn.classList.add('hidden')") },
  { name: 'Backdrop dismiss prevention', test: html.includes("if (authM.dataset.mandatory === 'true') return;") },
  { name: 'Escape key dismiss prevention', test: html.includes("if (authM && !authM.classList.contains('hidden') && authM.dataset.mandatory === 'true')") },
  { name: 'Session detected closes modal and unblurs', test: html.includes("closeAuthModal();") },
  { name: 'Sign out opens mandatory modal', test: html.includes("openAuthModal('signin', true);") },
  { name: 'Sign out fires offline beacon', test: html.includes("sendOfflineBeacon(state.authUser.email, state.authUser.name, state.authUser.provider);") },
  { name: 'Forbidden words check', test: !/KIIT|A30|MA 11009/i.test(html) }
];

let allPassed = true;
checks.forEach(c => {
  if (c.test) {
    console.log('✅ PASS:', c.name);
  } else {
    console.error('❌ FAIL:', c.name);
    allPassed = false;
  }
});

if (!allPassed) {
  process.exit(1);
} else {
  console.log('🌟 ALL PHASE 1 CHECKS PASSED SUCCESSFULLY');
}
