'use strict';

const C_KEYWORDS = new Set([
  'auto','break','case','char','const','continue','default','do','double',
  'else','enum','extern','float','for','goto','if','inline','int','long',
  'register','restrict','return','short','signed','sizeof','static','struct',
  'switch','typedef','union','unsigned','void','volatile','while'
]);

const PYTHON_ONLY_KEYWORDS = ['def','elif','lambda','yield','with','pass','except','raise','from','import','as','in','is','and','or','not','None','True','False','print'];
const JAVA_ONLY_KEYWORDS = ['public','private','protected','class','extends','implements','interface','throws','throw','new','instanceof','this','super','final','abstract','synchronized','native','strictfp','transient','volatile','enum'];
const JS_ONLY_KEYWORDS = ['let','const','var','function','typeof','undefined','null','=>','async','await','yield'];

function validate(code) {
  const errors = [];

  // Language mismatch checks
  const hasPythonMarkers = PYTHON_ONLY_KEYWORDS.some(kw => {
    const re = new RegExp(`\\b${kw}\\b`);
    return re.test(code);
  }) || code.includes('def ') || /^\s*(elif|except|pass|yield)\b/m.test(code);

  const hasJavaMarkers = JAVA_ONLY_KEYWORDS.some(kw => {
    const re = new RegExp(`\\b${kw}\\b`);
    return re.test(code);
  });

  const hasJSMarkers = /(let|const|var)\s+\w+\s*=/.test(code) || /=>\s*[{(]/.test(code) || /console\.log/.test(code);

  if (hasPythonMarkers) return { mismatch: true, error: 'Error: Code does not match selected language (detected Python)' };
  if (hasJavaMarkers) return { mismatch: true, error: 'Error: Code does not match selected language (detected Java)' };
  if (hasJSMarkers) return { mismatch: true, error: 'Error: Code does not match selected language (detected JavaScript)' };

  // Remove comments and strings for validation
  const clean = code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"[^"]*"|'[^']*'/g, '""');

  const lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Check brace balance
  let braceCount = 0;
  for (const ch of clean) {
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
  }
  if (braceCount > 0) errors.push('Syntax Error: Unmatched opening brace `{`');
  if (braceCount < 0) errors.push('Syntax Error: Unmatched closing brace `}`');

  // Check paren balance
  let parenCount = 0;
  for (const ch of clean) {
    if (ch === '(') parenCount++;
    if (ch === ')') parenCount--;
  }
  if (parenCount !== 0) errors.push('Syntax Error: Unmatched parentheses');

  // Check for semicolons on statements
  for (const line of lines) {
    // Skip preprocessor, empty, block starts/ends, labels
    if (line.startsWith('#') || line === '{' || line === '}' || line.endsWith('{') || line.endsWith('}') || line.endsWith(':')) continue;
    // Skip lines that are block endings or function stubs
    if (/^(if|for|while|else|switch|do)\s*[\(\{]/.test(line)) continue;
    if (/^else\s*\{?$/.test(line)) continue;
    if (/^do\s*\{?$/.test(line)) continue;
    // Regular statements should end with ; or }
    if (!/[;{}]$/.test(line) && !/^\s*\/\//.test(line)) {
      errors.push(`Syntax Error: Missing semicolon near: "${line.substring(0, 30)}"`);
      break;
    }
  }

  // Check for invalid use of Python-style print without parens in C
  if (/\bprintf\s*[^(]/.test(clean)) {
    errors.push('Syntax Error: printf requires parentheses');
  }

  // Check function definition format
  const funcDef = /\b\w+\s+\w+\s*\([^)]*\)\s*[^{;]/.test(clean.replace(/\n/g,' '));
  if (funcDef && braceCount === 0) {
    // Only an issue if we see function-like patterns without braces
  }

  return { errors };
}

module.exports = { validate };
