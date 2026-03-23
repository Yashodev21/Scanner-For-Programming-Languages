'use strict';

const C_KEYWORDS = new Set([
  'auto','break','case','char','const','continue','default','do','double',
  'else','enum','extern','float','for','goto','if','inline','int','long',
  'register','restrict','return','short','signed','sizeof','static','struct',
  'switch','typedef','union','unsigned','void','volatile','while','include',
  'define','printf','scanf','main','NULL','true','false'
]);

function tokenize(code) {
  const tokens = [];
  // Remove single-line comments
  code = code.replace(/\/\/[^\n]*/g, '');
  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');

  let i = 0;
  while (i < code.length) {
    // Skip whitespace
    if (/\s/.test(code[i])) { i++; continue; }

    // String literals
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let str = quote;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') { str += code[i]; i++; }
        str += code[i]; i++;
      }
      str += quote; i++;
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

    // Multi-char operators
    const twoChar = code.slice(i, i + 2);
    if (['++','--','+=','-=','*=','/=','%=','==','!=','>=','<=','&&','||','->'].includes(twoChar)) {
      tokens.push({ type: 'OPERATOR', value: twoChar });
      i += 2; continue;
    }

    // Single operators
    if ('+-*/%=><&|!'.includes(code[i])) {
      tokens.push({ type: 'OPERATOR', value: code[i] });
      i++; continue;
    }

    // Symbols
    if (';,(){}[]:'.includes(code[i])) {
      tokens.push({ type: 'SYMBOL', value: code[i] });
      i++; continue;
    }

    // Numbers (float or int)
    if (/\d/.test(code[i])) {
      let num = '';
      let isFloat = false;
      while (i < code.length && (/\d/.test(code[i]) || (code[i] === '.' && !isFloat))) {
        if (code[i] === '.') isFloat = true;
        num += code[i]; i++;
      }
      tokens.push({ type: isFloat ? 'FLOAT' : 'NUMBER', value: num });
      continue;
    }

    // Identifiers / Keywords
    if (/[a-zA-Z_#]/.test(code[i])) {
      let word = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        word += code[i]; i++;
      }
      tokens.push({ type: C_KEYWORDS.has(word) ? 'KEYWORD' : 'IDENTIFIER', value: word });
      continue;
    }

    i++;
  }
  return tokens;
}

module.exports = { tokenize };
