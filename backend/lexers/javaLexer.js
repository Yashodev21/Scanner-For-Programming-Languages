'use strict';

const JAVA_KEYWORDS = new Set([
  'abstract','assert','boolean','break','byte','case','catch','char','class',
  'const','continue','default','do','double','else','enum','extends','final',
  'finally','float','for','goto','if','implements','import','instanceof','int',
  'interface','long','native','new','package','private','protected','public',
  'return','short','static','strictfp','super','switch','synchronized','this',
  'throw','throws','transient','try','void','volatile','while','true','false',
  'null','String','System','out','println','print','main','args'
]);

function tokenize(code) {
  const tokens = [];
  code = code.replace(/\/\/[^\n]*/g, '');
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');

  let i = 0;
  while (i < code.length) {
    if (/\s/.test(code[i])) { i++; continue; }

    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let str = quote; i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') { str += code[i]; i++; }
        str += code[i]; i++;
      }
      str += quote; i++;
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

    const twoChar = code.slice(i, i + 2);
    if (['++','--','+=','-=','*=','/=','%=','==','!=','>=','<=','&&','||','->'].includes(twoChar)) {
      tokens.push({ type: 'OPERATOR', value: twoChar });
      i += 2; continue;
    }

    if ('+-*/%=><&|!'.includes(code[i])) {
      tokens.push({ type: 'OPERATOR', value: code[i] });
      i++; continue;
    }

    if (';,(){}[]:@'.includes(code[i])) {
      tokens.push({ type: 'SYMBOL', value: code[i] });
      i++; continue;
    }

    if (/\d/.test(code[i])) {
      let num = ''; let isFloat = false;
      while (i < code.length && (/\d/.test(code[i]) || (code[i] === '.' && !isFloat))) {
        if (code[i] === '.') isFloat = true;
        num += code[i]; i++;
      }
      // Handle long/float suffixes
      if (i < code.length && /[lLfFdD]/.test(code[i])) {
        num += code[i]; i++;
      }
      tokens.push({ type: isFloat ? 'FLOAT' : 'NUMBER', value: num });
      continue;
    }

    if (/[a-zA-Z_]/.test(code[i])) {
      let word = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        word += code[i]; i++;
      }
      tokens.push({ type: JAVA_KEYWORDS.has(word) ? 'KEYWORD' : 'IDENTIFIER', value: word });
      continue;
    }

    i++;
  }
  return tokens;
}

module.exports = { tokenize };
