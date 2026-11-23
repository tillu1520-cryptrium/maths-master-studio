import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('--- EXECUTING BUILD PIPELINE ---');

// 0. Verify Script Syntax in index.html
import vm from 'vm';
const htmlSource = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let m;
let sIdx = 0;
while ((m = scriptRegex.exec(htmlSource)) !== null) {
  sIdx++;
  const code = m[1];
  if (!code.trim()) continue;
  try {
    new vm.Script(code, { filename: `index.html:<script-${sIdx}>` });
  } catch (err) {
    console.error(`FATAL BUILD ERROR: SyntaxError in index.html script #${sIdx}:`, err);
    process.exit(1);
  }
}
console.log('PASS: All inline scripts in index.html verified syntactically valid with zero errors');

// 1. Run Verification Test Suites
execSync('node scripts/test_full_vfx.mjs', { stdio: 'inherit' });
execSync('node scripts/test_toggle.mjs', { stdio: 'inherit' });
execSync('node scripts/test_phase2_phase3.mjs', { stdio: 'inherit' });
execSync('node scripts/test_end_to_end_polish.mjs', { stdio: 'inherit' });
execSync('node scripts/test_performance_audit.mjs', { stdio: 'inherit' });
execSync('node scripts/test_tab_mounting.mjs', { stdio: 'inherit' });
execSync('node scripts/scan_katex_errors.mjs', { stdio: 'inherit' });
execSync('node scripts/test_final_polish_bugs.mjs', { stdio: 'inherit' });
execSync('node scripts/verify_all_7_steps.mjs', { stdio: 'inherit' });

// 2. Ensure public/ directory has all root assets
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

const syncFiles = [
  'index.html',
  'favicon.svg',
  'manifest.json',
  'sw.js',
  'exam_questions_bank.json',
  'exam_questions_bank_verified.json'
];

for (const file of syncFiles) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('public', file));
    console.log(`Synced ${file} -> public/${file}`);
  }
}

const allSakugaScripts = [
  'button.js', 'toggle.js', 'slider.js', 'checkbox.js', 'radio.js',
  'input.js', 'tabs.js', 'progress.js', 'rating.js', 'toast.js', 'tooltip.js'
];

// Ensure public/sakuga-vfx has all 11 scripts
if (fs.existsSync('sakuga-vfx')) {
  if (!fs.existsSync('public/sakuga-vfx')) {
    fs.mkdirSync('public/sakuga-vfx', { recursive: true });
  }
  for (const s of allSakugaScripts) {
    if (fs.existsSync(path.join('sakuga-vfx', s))) {
      fs.copyFileSync(path.join('sakuga-vfx', s), path.join('public/sakuga-vfx', s));
      console.log(`Synced sakuga-vfx/${s} -> public/sakuga-vfx/${s}`);
    }
  }
}

console.log('>>> BUILD COMPLETED SUCCESSFULLY (Output ready for both root and public)! <<<');
