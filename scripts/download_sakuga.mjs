import https from 'https';
import fs from 'fs';
import path from 'path';

const components = [
  'button', 'toggle', 'slider', 'checkbox', 'radio',
  'input', 'tabs', 'progress', 'rating', 'toast', 'tooltip'
];

async function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status: ${res.statusCode} for ${url}`));
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync('sakuga-vfx')) fs.mkdirSync('sakuga-vfx', { recursive: true });
  if (!fs.existsSync('public/sakuga-vfx')) fs.mkdirSync('public/sakuga-vfx', { recursive: true });

  for (const name of components) {
    const url = `https://raw.githubusercontent.com/finktheartist/sakuga-vfx/main/${name}/${name}.js`;
    console.log(`Fetching ${name}...`);
    const content = await fetchFile(url);
    const targetFile = path.join('sakuga-vfx', `${name}.js`);
    const publicTarget = path.join('public/sakuga-vfx', `${name}.js`);
    fs.writeFileSync(targetFile, content);
    fs.writeFileSync(publicTarget, content);
    
    const tagMatch = content.match(/define\(['"]([^'"]+)['"]/);
    console.log(`✓ Saved ${name}.js (${content.length} bytes), Tag: <${tagMatch ? tagMatch[1] : 'unknown'}>`);
  }
}

main().catch(err => {
  console.error('Download error:', err);
  process.exit(1);
});
