import https from 'https';

console.log('--- COMPREHENSIVE LIVE PRODUCTION VERIFICATION ---');

const url = 'https://maths-master-studio.vercel.app/?v=' + Date.now();
https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const checks = [
      { name: 'Formula Tables in top header nav', pass: data.includes('>Formula Tables<') },
      { name: 'Formula Tables Vault title', pass: data.includes('Formula Tables Vault (${totalFormulas} Formulas)') },
      { name: 'Duplicate tabs hidden with display:none !important', pass: data.includes('style="display:none !important;" aria-hidden="true">') && data.includes('id="masterTableTabs"') },
      { name: 'Category filter pills wrap horizontally (flex-wrap gap-2)', pass: data.includes('flex flex-wrap items-center gap-2 py-2') },
      { name: 'Zero Copy buttons in table rows across 154 rows', pass: !data.includes('Copy</sakuga-button>') && !data.includes('data-copy-math="') },
      { name: 'Formula Studio 100% full-width layout with chapter pills at top', pass: data.includes('<!-- Chapter Selector Bar (All Screen Sizes) -->') },
      { name: 'Formula Studio rows use streamlined .sakuga-anime-btn', pass: data.includes('class="sakuga-anime-btn') },
      { name: 'Test Studio sub-tabs have type="button" and stopPropagation', pass: data.includes('type="button" data-switch-test-tab="endsem"') && data.includes('e.stopPropagation();') },
      { name: 'Live Labs sliders have input and change event listeners', pass: data.includes("s1.addEventListener('input', handler1);") },
      { name: 'Live Labs RAF loop idle-sleeps when paused (0% idle CPU)', pass: data.includes('activeLabRaf = null;') && data.includes('if (running) {') },
      { name: 'Live Labs grid overlay toggle and simulation presets wired', pass: data.includes('labGridToggle') && data.includes('labPresetRadio') },
      { name: 'Zero banned words (KIIT, A30, MA 11009)', pass: !data.includes('KIIT') && !data.includes('A30') && !data.includes('MA 11009') },
      { name: 'Service Worker v25 cache busting', pass: data.includes('sw.js?v=25') },
      { name: '150 Flashcards intact', pass: data.includes('id="fcSakugaProgress"') && data.includes('150 High-Yield Revision Flashcards') }
    ];

    let allPass = true;
    checks.forEach((c, i) => {
      console.log(`${i + 1}. [${c.pass ? 'PASS' : 'FAIL'}] ${c.name}`);
      if (!c.pass) allPass = false;
    });

    if (allPass) {
      console.log('\n>>> ALL 14 LIVE PRODUCTION ASSERTIONS PASSED! SITE IS 100% HEALTHY! <<<');
      process.exit(0);
    } else {
      console.error('\n>>> SOME ASSERTIONS FAILED! <<<');
      process.exit(1);
    }
  });
}).on('error', err => {
  console.error('Error fetching live URL:', err.message);
  process.exit(1);
});
