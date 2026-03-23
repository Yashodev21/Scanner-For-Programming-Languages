'use strict';

const PYTHON_SIGNALS = ['def ', 'elif ', 'lambda ', '    pass', '\tpass', 'print('];
const C_SIGNALS = ['#include', '#define', 'printf(', 'scanf(', '->'];
const JS_SIGNALS = ['=>', 'console.log', 'typeof ', 'undefined'];

function validate(code) {
  const errors = [];

  // Mismatch detection
  const hasPython = PYTHON_SIGNALS.some(s => code.includes(s)) ||
    /^\s*def\s+\w+\s*\(/m.test(code);
  const hasC = C_SIGNALS.some(s => code.includes(s));
  const hasJS = JS_SIGNALS.some(s => code.includes(s)) ||
    /\b(let|const|var)\s+\w+\s*=/.test(code);

  if (hasPython) return { mismatch: true, error: 'Error: Code does not match selected language (detected Python)' };
  if (hasC) return { mismatch: true, error: 'Error: Code does not match selected language (detected C)' };
  if (hasJS) return { mismatch: true, error: 'Error: Code does not match selected language (detected JavaScript)' };

  const clean = code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"[^"]*"|'[^']*'/g, '""');

  const lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 0);

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

  // Statements must end with ;
  for (const line of lines) {
    if (line.startsWith('@') || line === '{' || line === '}' || line.endsWith('{') || line.endsWith('}')) continue;
    if (/^(if|for|while|else|switch|do|try|catch|finally|class|interface|enum)\b/.test(line)) continue;
    if (/^(public|private|protected|static|abstract|final)\s+(class|interface|enum)\b/.test(line)) continue;
    if (/^(public|private|protected|static|abstract|final|void|\w+)\s+\w+\s*\(/.test(line) && line.endsWith('{')) continue;
    if (/\)$/.test(line) && !line.includes(';')) {
      // might be multi-line method signature
    }
    if (!/[;{}]$/.test(line)) {
      errors.push(`Syntax Error: Missing semicolon near: "${line.substring(0, 30)}"`);
      break;
    }
  }

  // Check class structure
  const hasClass = /\bclass\s+\w+/.test(clean);
  if (!hasClass && clean.trim().length > 20) {
    // Warn but don't error - could be just a snippet
  }

  // Check for proper main method pattern
  const hasMain = /public\s+static\s+void\s+main/.test(clean);

  // Check access modifiers on methods (basic)
  const methodWithoutModifier = /^\s{4}(void|int|String|boolean|char|double|float|long)\s+\w+\s*\(/.test(clean);
  if (methodWithoutModifier) {
    errors.push('Syntax Warning: Method may be missing access modifier (public/private/protected)');
  }

  return { errors };
}

module.exports = { validate };
