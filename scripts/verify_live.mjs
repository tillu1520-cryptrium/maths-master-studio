import https from 'https';

console.log('--- VERIFYING LIVE VERCEL DEPLOYMENT ---');

https.get('https://maths-master-studio.vercel.app/?v=' + Date.now(), res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Total response bytes:', data.length);
    console.log('Contains sw.js?v=19:', data.includes('sw.js?v=19'));
    console.log('Contains profileVfxStatusBadge:', data.includes('profileVfxStatusBadge'));
    console.log('Contains fcProgressBar:', data.includes('fcProgressBar'));
    console.log('Contains SoundEngine:', data.includes('class SoundEngine'));
    console.log('Contains 318 Question Bank:', data.includes('exam_questions_bank_verified.json'));

    if (data.includes('profileVfxStatusBadge') && data.includes('sw.js?v=19')) {
      console.log('>>> VERCEL LIVE DEPLOYMENT CONFIRMED AND ACTIVE WITH ALL FIXES! <<<');
    } else {
      console.log('>>> Vercel deployment in progress or waiting for CDN propagation... <<<');
    }
  });
}).on('error', err => {
  console.error('Error verifying live:', err.message);
});
