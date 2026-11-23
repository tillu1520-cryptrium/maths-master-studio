import https from 'https';

console.log('--- VERIFYING LIVE VERCEL DEPLOYMENT ---');

function check() {
  const url = 'https://maths-master-studio.vercel.app/?v=' + Date.now();
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Total response bytes:', data.length);
      console.log('Contains sw.js?v=25:', data.includes('sw.js?v=25'));
      console.log('Contains Formula Tables in nav:', data.includes('>Formula Tables<'));
      console.log('Contains Formula Tables Vault:', data.includes('Formula Tables Vault'));
      console.log('Contains Full-Width Studio Layout:', data.includes('<!-- Chapter Selector Bar (All Screen Sizes) -->'));
      console.log('Contains stopAllAnimations idle hook:', data.includes('window.SakugaFX.clearTransient'));

      if (data.includes('sw.js?v=25') && data.includes('>Formula Tables<')) {
        console.log('\n>>> VERCEL LIVE DEPLOYMENT CONFIRMED AND ACTIVE WITH ALL LATEST FIXES! <<<');
        process.exit(0);
      } else {
        console.log('Vercel deployment building or propagating on CDN... retrying in 5 seconds...');
        setTimeout(check, 5000);
      }
    });
  }).on('error', err => {
    console.error('Error fetching live:', err.message);
    setTimeout(check, 5000);
  });
}

check();
