import https from 'https';

const url = 'https://maths-master-studio.vercel.app/?t=' + Date.now();
https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Cache-Control:', res.headers['cache-control']);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Total response bytes:', data.length);
    console.log('Contains vfxSwitchTrack:', data.includes('id="vfxSwitchTrack"'));
    console.log('Contains profileVfxToggleBtn:', data.includes('id="profileVfxToggleBtn"'));
    console.log('Contains sw.js?v=8:', data.includes('sw.js?v=8'));
    console.log('Contains exam_questions_bank_verified.json:', data.includes('exam_questions_bank_verified.json'));
    if (res.statusCode === 200 && data.includes('id="vfxSwitchTrack"')) {
      console.log('>>> VERCEL LIVE DEPLOYMENT CONFIRMED AND ACTIVE! <<<');
    } else {
      console.log('Waiting for Vercel build/propagation...');
    }
  });
}).on('error', err => console.error(err));
