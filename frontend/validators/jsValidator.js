'use strict';

const PYTHON_SIGNALS = ['def ', 'elif ', 'lambda:', '\n    pass\n', 'print('];
const C_SIGNALS = ['#include', '#define', 'printf(', 'scanf('];
const JAVA_SIGNALS = ['public class', 'System.out.println', 'import java'];

function validate(code) {
  const errors = [];

  // Mismatch detection
  const hasPython = PYTHON_SIGNALS.some(s => code.includes(s)) ||
    /^\s*def\s+\w+\s*\(/m.test(code);
  const hasC = C_SIGNALS.some(s => code.includes(s));
  const hasJava = JAVA_SIGNALS.some(s => code.includes(s));

  if (hasPython) return { mismatch: true, error: 'Error: Code does not match selected language (detected Python)' };
  if (hasC) return { mismatch: true, error: 'Error: Code does not match selected language (detected C)' };
  if (hasJava) return { mismatch: true, error: 'Error: Code does not match selected language (detected Java)' };

  const clean = code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/`[^`]*`/g, '""')
    .replace(/"[^"]*"|'[^']*'/g, '""');

  // Brace balance
  let braceCount = 0;
  for (const ch of clean) {
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
  }
  if (braceCount > 0) errors.push('Syntax Error: Unmatched opening brace `{`');
  if (braceCount < 0) errors.push('Syntax Error: Unmatched closing brace `}`');

  // Paren balance
  let parenCount = 0;
  for (const ch of clean) {
    if (ch === '(') parenCount++;
    if (ch === ')') parenCount--;
  }
  if (parenCount !== 0) errors.push('Syntax Error: Unmatched parentheses');

  // Bracket balance
  let bracketCount = 0;
  for (const ch of clean) {
    if (ch === '[') bracketCount++;
    if (ch === ']') bracketCount--;
  }
  if (bracketCount !== 0) errors.push('Syntax Error: Unmatched square brackets');

  // Check arrow function syntax
  const badArrow = /=>\s*[^{(\s\w"'`[]/g;
  if (badArrow.test(clean)) {
    errors.push('Syntax Error: Invalid arrow function syntax');
  }

  // Check for var/let/const without assignment operator
  const declLines = clean.split('\n').filter(l => /^\s*(var|let|const)\s+/.test(l));
  for (const dl of declLines) {
    const stripped = dl.trim();
    // const without initializer (except in for loops)
    if (/^const\s+\w+\s*;/.test(stripped)) {
      errors.push('Syntax Error: const declaration must be initialized');
    }
  }

  // Check for function syntax
  const badFunc = /function\s*\(\s*\)\s*[^{]/.test(clean.replace(/\n/g,' ')) &&
    !/function\s*\(\s*\)\s*\{/.test(clean.replace(/\n/g,' ')) &&
    !/function\s+\w+\s*\(/.test(clean);

  // Check for incomplete ternary
  const lines = clean.split('\n');
  for (const line of lines) {
    const questionCount = (line.match(/\?/g) || []).length;
    const colonCount = (line.match(/:/g) || []).length;
    if (questionCount > 0 && questionCount !== colonCount && !line.includes('?.')) {
      // ternary mismatch - but skip object literals
      if (!/{/.test(line)) {
        errors.push(`Syntax Warning: Possible incomplete ternary expression`);
        break;
      }
    }
  }

  // Check for common invalid operator usage
  if (/[^=!<>]=[^=>].*==/.test(clean.replace(/\n/g,' '))) {
    // assignment then comparison same expression - suspicious
  }

  return { errors };
}

module.exports = { validate };
