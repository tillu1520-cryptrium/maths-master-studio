import fs from 'fs';
import path from 'path';
import katex from 'katex';

const bankPath = path.resolve('src/data/verified_question_bank.json');
if (!fs.existsSync(bankPath)) {
  console.error('File not found:', bankPath);
  process.exit(1);
}

const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
console.log(`Linting ${bank.length} questions in ${bankPath}...`);

let errors = [];
let missingSolutions = 0;
let literalNewlines = 0;
let smashedProse = 0;

function checkMathExpression(expr, context, displayMode = false) {
  if (!expr) return;
  // If expr contains \text{...}, katex handles it.
  try {
    katex.renderToString(expr, {
      throwOnError: true,
      displayMode
    });
  } catch (err) {
    errors.push({ context, expr, error: err.message });
  }
}

function lintStringForMath(str, context) {
  if (!str) return;

  // Check for literal \n
  if (str.includes('\\n') || str.includes('\r\n')) {
    literalNewlines++;
    errors.push({ context, error: 'Literal \\n detected in string' });
  }

  // Check for smashed prose / words (e.g. "limx", "eq0", "forx")
  if (/\b(lim[xyz]|for[xyz]|eq[0-9]|and[xyz])\b/i.test(str)) {
    smashedProse++;
    errors.push({ context, error: `Smashed prose detected: ${str.slice(0, 50)}...` });
  }

  // Check display math $$...$$
  const displayMatches = str.matchAll(/\$\$(.*?)\$\$/gs);
  for (const m of displayMatches) {
    checkMathExpression(m[1].trim(), `${context} [display math]`, true);
  }

  // Check inline math $...$
  // First strip display math to avoid false positive on $$
  const stripped = str.replace(/\$\$(.*?)\$\$/gs, '');
  const inlineMatches = stripped.matchAll(/\$([^\$]+)\$/g);
  for (const m of inlineMatches) {
    checkMathExpression(m[1].trim(), `${context} [inline math]`, false);
  }
}

bank.forEach((q, idx) => {
  const qId = q.id || `Item #${idx}`;

  // 1. Check required fields
  if (!q.id || !q.chapter || !q.topic || !q.marks) {
    errors.push({ context: `${qId}`, error: 'Missing core metadata (id, chapter, topic, marks)' });
  }

  // 2. Check questionLatex
  if (!q.questionLatex) {
    errors.push({ context: `${qId}.questionLatex`, error: 'Empty questionLatex' });
  } else {
    lintStringForMath(q.questionLatex, `${qId}.questionLatex`);
  }

  // 3. Check options
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push({ context: `${qId}.options`, error: `Expected exactly 4 options, got ${q.options?.length}` });
  } else {
    // Check distinct options
    const optSet = new Set(q.options.map(o => o.trim()));
    if (optSet.size < 4) {
      errors.push({ context: `${qId}.options`, error: `Duplicate options found: only ${optSet.size} distinct` });
    }

    q.options.forEach((opt, oIdx) => {
      // Option can be math or prose with math
      if (opt.includes('$')) {
        lintStringForMath(opt, `${qId}.options[${oIdx}]`);
      } else {
        checkMathExpression(opt, `${qId}.options[${oIdx}]`, false);
      }
    });
  }

  // 4. Check correctOptionIndex
  if (typeof q.correctOptionIndex !== 'number' || q.correctOptionIndex < 0 || q.correctOptionIndex > 3) {
    errors.push({ context: `${qId}.correctOptionIndex`, error: `Invalid correctOptionIndex: ${q.correctOptionIndex}` });
  } else if (q.options && q.options[q.correctOptionIndex] !== q.finalAnswerLatex) {
    errors.push({ context: `${qId}.finalAnswerLatex`, error: 'finalAnswerLatex does not match options[correctOptionIndex]' });
  }

  // 5. Check hint
  if (!q.hint) {
    errors.push({ context: `${qId}.hint`, error: 'Missing hint' });
  } else {
    lintStringForMath(q.hint, `${qId}.hint`);
  }

  // 6. Check detailedSolutionSteps
  if (!Array.isArray(q.detailedSolutionSteps) || q.detailedSolutionSteps.length === 0) {
    missingSolutions++;
    errors.push({ context: `${qId}.detailedSolutionSteps`, error: 'Missing detailedSolutionSteps' });
  } else {
    q.detailedSolutionSteps.forEach((step, sIdx) => {
      const stepText = typeof step === 'string' ? step : (step.content || step.text || '');
      if (!stepText) {
        errors.push({ context: `${qId}.detailedSolutionSteps[${sIdx}]`, error: 'Empty step' });
      } else {
        lintStringForMath(stepText, `${qId}.detailedSolutionSteps[${sIdx}]`);
      }
    });
  }

  // 7. Check finalAnswerLatex
  if (!q.finalAnswerLatex) {
    errors.push({ context: `${qId}.finalAnswerLatex`, error: 'Empty finalAnswerLatex' });
  } else {
    if (q.finalAnswerLatex.includes('$')) {
      lintStringForMath(q.finalAnswerLatex, `${qId}.finalAnswerLatex`);
    } else {
      checkMathExpression(q.finalAnswerLatex, `${qId}.finalAnswerLatex`, false);
    }
  }
});

console.log('\n=== LINT REPORT ===');
console.log(`Total Errors: ${errors.length}`);
console.log(`Missing Detailed Solutions: ${missingSolutions}`);
console.log(`Literal \\n Count: ${literalNewlines}`);
console.log(`Smashed Prose Count: ${smashedProse}`);

if (errors.length > 0) {
  console.log('\nFirst 20 errors:');
  errors.slice(0, 20).forEach(e => {
    console.log(`- [${e.context}]: ${e.error} ${e.expr ? '(' + e.expr + ')' : ''}`);
  });
  process.exit(1);
} else {
  console.log('\n🌟 100% PASS: 0 KaTeX errors, 0 missing detailed solutions, 0 literal \\n, and 0 smashed prose strings!');
  process.exit(0);
}
