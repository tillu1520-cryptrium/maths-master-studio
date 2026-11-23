import fs from 'fs';
import katex from 'katex';

console.log('=== VERIFYING ZERO KATEX ERRORS ACROSS ENTIRE CODEBASE ===');

let totalRendered = 0;
let errors = [];

function testRender(tex, display = false, ctx = '') {
  if (!tex || typeof tex !== 'string') return;
  const s = tex.trim();
  if (!s) return;
  totalRendered++;
  try {
    const res = katex.renderToString(s, {
      displayMode: display,
      throwOnError: false,
      strict: false
    });
    if (res.includes('class="katex-error"') || res.includes('KaTeX parse error')) {
      errors.push({ ctx, tex: s, error: 'Contains katex-error class' });
    }
  } catch (err) {
    errors.push({ ctx, tex: s, error: err.message });
  }
}

// Emulate website formatMathText
function scanText(raw, ctx) {
  if (!raw) return;
  const str = String(raw).replace(/\\n/g, '\n').trim();
  const mathPattern = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?:\\\$|[^$\n])+?\$)/g;
  let lastIdx = 0;
  let match;
  let foundAny = false;

  while ((match = mathPattern.exec(str)) !== null) {
    foundAny = true;
    const tok = match[0];
    if (tok.startsWith('$$') || tok.startsWith('\\[')) {
      testRender(tok.slice(2, -2).trim(), true, `${ctx} [display]`);
    } else if (tok.startsWith('\\(')) {
      testRender(tok.slice(2, -2).trim(), false, `${ctx} [inline \\(...\\)]`);
    } else if (tok.startsWith('$')) {
      testRender(tok.slice(1, -1).trim(), false, `${ctx} [inline $...$]`);
    }
    lastIdx = match.index + tok.length;
  }

  if (lastIdx < str.length) {
    const remaining = str.substring(lastIdx);
    if (!foundAny) {
      if (str.includes('\\') || str.includes('^') || str.includes('_')) {
        testRender(str, false, `${ctx} [raw math]`);
      }
    } else if (/\\[a-zA-Z]+/.test(remaining)) {
      testRender(remaining, false, `${ctx} [remaining raw]`);
    }
  }
}

// 1. Scan exam_questions_bank_verified.json
console.log('--- Scanning exam_questions_bank_verified.json ---');
const qBank = JSON.parse(fs.readFileSync('exam_questions_bank_verified.json', 'utf8'));
qBank.forEach((q, idx) => {
  const id = q.id || `Q#${idx + 1}`;
  scanText(q.prompt, `${id}.prompt`);
  if (q.promptMath) testRender(q.promptMath, true, `${id}.promptMath`);
  scanText(q.answer, `${id}.answer`);
  scanText(q.solution, `${id}.solution`);
  scanText(q.hint, `${id}.hint`);
  scanText(q.sillyTrap, `${id}.sillyTrap`);
  if (Array.isArray(q.options)) {
    q.options.forEach((opt, oIdx) => {
      const text = typeof opt === 'string' ? opt : (opt?.text || '');
      scanText(text, `${id}.options[${oIdx}]`);
    });
  }
  if (Array.isArray(q.steps)) {
    q.steps.forEach((st, sIdx) => {
      scanText(st.text, `${id}.steps[${sIdx}].text`);
      if (st.math) testRender(st.math, true, `${id}.steps[${sIdx}].math`);
    });
  }
});

// 2. Scan DATA in index.html
console.log('--- Scanning DATA in index.html ---');
const html = fs.readFileSync('index.html', 'utf8');
const dIdx = html.indexOf('const DATA = ');
const endIdx = html.indexOf(';\n', dIdx);
const data = JSON.parse(html.slice(dIdx + 13, endIdx));

// Tables
data.masterTables.forEach((t) => {
  t.rows.forEach((r, rIdx) => {
    r.forEach((col, cIdx) => {
      scanText(col, `masterTables.${t.id}[${rIdx}][${cIdx}]`);
    });
  });
});

// Flashcards
data.flashcards.forEach((fc, idx) => {
  scanText(fc.qText, `flashcard[${idx}].qText`);
  if (fc.qMath) testRender(fc.qMath, true, `flashcard[${idx}].qMath`);
  scanText(fc.aText, `flashcard[${idx}].aText`);
  if (fc.aMath) testRender(fc.aMath, true, `flashcard[${idx}].aMath`);
  scanText(fc.tip, `flashcard[${idx}].tip`);
});

// Chapters
data.chapters.forEach((ch, cIdx) => {
  if (ch.topics) {
    ch.topics.forEach((top, tIdx) => {
      scanText(top.title, `chapters[${cIdx}].topics[${tIdx}].title`);
      if (top.formula) testRender(top.formula, true, `chapters[${cIdx}].topics[${tIdx}].formula`);
      if (top.math) testRender(top.math, true, `chapters[${cIdx}].topics[${tIdx}].math`);
      scanText(top.desc, `chapters[${cIdx}].topics[${tIdx}].desc`);
    });
  }
});

console.log(`\n========================================`);
console.log(`TOTAL MATH EXPRESSIONS TESTED: ${totalRendered}`);
console.log(`KATEX ERRORS FOUND: ${errors.length}`);
console.log(`========================================`);

if (errors.length > 0) {
  console.error(`FAILED: ${errors.length} KaTeX errors found!`);
  errors.forEach((err, i) => {
    console.error(`[#${i + 1}] ${err.ctx}: "${err.tex}" -> ${err.error}`);
  });
  process.exit(1);
} else {
  console.log(`SUCCESS: 0 KaTeX errors across all ${totalRendered} mathematical expressions!`);
  process.exit(0);
}
