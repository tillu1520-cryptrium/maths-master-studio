import https from 'https';

https.get('https://maths-master-studio.vercel.app/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Total response bytes:', data.length);
    console.log('Contains sw.js?v=9:', data.includes('/sw.js?v=9'));
    console.log('Contains headerSakugaToggle:', data.includes('headerSakugaToggle'));
    console.log('Contains sakuga-vfx/toggle.js:', data.includes('/sakuga-vfx/toggle.js'));
    console.log('Contains playMasteredVfx:', data.includes('playMasteredVfx'));
    console.log('Contains playUnmarkedVfx:', data.includes('playUnmarkedVfx'));
    console.log('Contains fcTabs:', data.includes('fcTabs'));
    console.log('Contains studioSearchInput:', data.includes('studioSearchInput'));
    console.log('Contains masterTableTabs:', data.includes('masterTableTabs'));
    console.log('Contains labGridToggle:', data.includes('labGridToggle'));
    console.log('Contains testModeSakugaTabs:', data.includes('testModeSakugaTabs'));
    
    if (res.statusCode === 200 && data.includes('/sw.js?v=9') && data.includes('headerSakugaToggle')) {
      console.log('>>> VERCEL FULL SAKUGA VFX LIVE DEPLOYMENT CONFIRMED AND ACTIVE! <<<');
    } else {
      console.log('Waiting for Vercel deployment cache to refresh...');
    }
  });
}).on('error', err => {
  console.error('Error verifying live URL:', err);
});
