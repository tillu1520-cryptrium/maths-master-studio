import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('--- EXECUTING BUILD PIPELINE ---');

// 1. Run Verification Test Suites
execSync('node scripts/test_phase2.mjs', { stdio: 'inherit' });
execSync('node scripts/test_toggle.mjs', { stdio: 'inherit' });

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

// Ensure public/sakuga-vfx has all 4 scripts
if (fs.existsSync('sakuga-vfx')) {
  if (!fs.existsSync('public/sakuga-vfx')) {
    fs.mkdirSync('public/sakuga-vfx', { recursive: true });
  }
  for (const s of ['button.js', 'progress.js', 'slider.js', 'toast.js']) {
    if (fs.existsSync(path.join('sakuga-vfx', s))) {
      fs.copyFileSync(path.join('sakuga-vfx', s), path.join('public/sakuga-vfx', s));
      console.log(`Synced sakuga-vfx/${s} -> public/sakuga-vfx/${s}`);
    }
  }
}

console.log('>>> BUILD COMPLETED SUCCESSFULLY (Output ready for both root and public)! <<<');
