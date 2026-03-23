'use strict';

const C_SIGNALS = ['#include', '#define', 'printf(', 'scanf(', '->'];
const JAVA_SIGNALS = ['public class', 'public static', 'System.out', 'import java'];
const JS_SIGNALS = ['=>', 'console.log', 'typeof ', 'undefined', 'const ', 'let ', 'var '];

function validate(code) {
  const errors = [];

  // Mismatch detection
  const hasC = C_SIGNALS.some(s => code.includes(s));
  const hasJava = JAVA_SIGNALS.some(s => code.includes(s));
  const hasJS = JS_SIGNALS.some(s => code.includes(s)) && !/\bdef\b/.test(code);

  if (hasC) return { mismatch: true, error: 'Error: Code does not match selected language (detected C)' };
  if (hasJava) return { mismatch: true, error: 'Error: Code does not match selected language (detected Java)' };
  if (hasJS) return { mismatch: true, error: 'Error: Code does not match selected language (detected JavaScript)' };

  // Remove comments
  const lines = code.split('\n');
  const codeLines = lines.map(l => l.replace(/#[^\n]*/, ''));

  // Check for C/Java style semicolons at end of statements (not strings)
  const semicolonLine = codeLines.find(l => {
    const stripped = l.replace(/["'][^"']*["']/g, '').trim();
    return stripped.endsWith(';') && !stripped.startsWith('#');
  });
  if (semicolonLine) {
    errors.push(`Syntax Error: Python does not use semicolons (found in: "${semicolonLine.trim().substring(0,30)}")`);
  }

  // Check colon after def/class/if/else/elif/for/while/try/except/finally/with
  const blockStatements = /^\s*(def|class|if|elif|else|for|while|try|except|finally|with)\s*/;
  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i].trimEnd();
    if (!line.trim()) continue;
    if (blockStatements.test(line)) {
      // Check it ends with : or ( or \ (continuation)
      const stripped = line.replace(/#.*/, '').trimEnd();
      if (!stripped.endsWith(':') && !stripped.endsWith('\\') && !stripped.endsWith('(') && !stripped.endsWith(',')) {
        // Could be multiline - check if next line is indented
        const nextLine = codeLines[i + 1];
        if (!nextLine || !nextLine.startsWith(' ') && !nextLine.startsWith('\t')) {
          errors.push(`Syntax Error: Missing ':' after "${line.trim().substring(0, 30)}"`);
          break;
        }
      }
    }
  }

  // Check for def syntax
  const defLines = codeLines.filter(l => /^\s*def\s/.test(l));
  for (const defLine of defLines) {
    if (!/def\s+\w+\s*\(/.test(defLine)) {
      errors.push('Syntax Error: Invalid function definition syntax');
    }
  }

  // Check for unmatched parentheses
  let parenCount = 0;
  const cleanCode = code.replace(/["'][^"']*["']/g, '""').replace(/#[^\n]*/g, '');
  for (const ch of cleanCode) {
    if (ch === '(') parenCount++;
    if (ch === ')') parenCount--;
  }
  if (parenCount !== 0) errors.push('Syntax Error: Unmatched parentheses');

  // Check bracket balance
  let bracketCount = 0;
  for (const ch of cleanCode) {
    if (ch === '[') bracketCount++;
    if (ch === ']') bracketCount--;
  }
  if (bracketCount !== 0) errors.push('Syntax Error: Unmatched square brackets');

  // Check indentation consistency (tabs vs spaces)
  const tabLines = codeLines.filter(l => l.startsWith('\t'));
  const spaceLines = codeLines.filter(l => l.startsWith('  ') && !l.startsWith('\t'));
  if (tabLines.length > 0 && spaceLines.length > 0) {
    errors.push('Syntax Error: Mixed tabs and spaces in indentation');
  }

  return { errors };
}

module.exports = { validate };
