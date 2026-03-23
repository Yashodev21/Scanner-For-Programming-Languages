'use strict';

const JS_KEYWORDS = new Set([
  'abstract','arguments','await','boolean','break','byte','case','catch','char',
  'class','const','continue','debugger','default','delete','do','double','else',
  'enum','eval','export','extends','false','final','finally','float','for',
  'function','goto','if','implements','import','in','instanceof','int',
  'interface','let','long','native','new','null','package','private','protected',
  'public','return','short','static','super','switch','synchronized','this',
  'throw','throws','transient','true','try','typeof','undefined','var','void',
  'volatile','while','with','yield','console','log','Math','Array','Object',
  'String','Number','Promise','async','of','from','require','module','exports'
]);

function tokenize(code) {
  const tokens = [];
  // Remove single-line comments
  code = code.replace(/\/\/[^\n]*/g, '');
  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');

  let i = 0;
  while (i < code.length) {
    if (/\s/.test(code[i])) { i++; continue; }

    // Template literals
    if (code[i] === '`') {
      let str = '`'; i++;
      while (i < code.length && code[i] !== '`') {
        str += code[i]; i++;
      }
      str += '`'; i++;
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

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

    // Three-char operators
    const threeChar = code.slice(i, i + 3);
    if (['===','!==','...','**='].includes(threeChar)) {
      tokens.push({ type: 'OPERATOR', value: threeChar });
      i += 3; continue;
    }

    const twoChar = code.slice(i, i + 2);
    if (['++','--','+=','-=','*=','/=','%=','==','!=','>=','<=','&&','||','??','=>','**','->'].includes(twoChar)) {
      tokens.push({ type: 'OPERATOR', value: twoChar });
      i += 2; continue;
    }

    if ('+-*/%=><&|!~^'.includes(code[i])) {
      tokens.push({ type: 'OPERATOR', value: code[i] });
      i++; continue;
    }

    if (';,(){}[]:?.'.includes(code[i])) {
      tokens.push({ type: 'SYMBOL', value: code[i] });
      i++; continue;
    }

    if (/\d/.test(code[i])) {
      let num = ''; let isFloat = false;
      while (i < code.length && (/\d/.test(code[i]) || (code[i] === '.' && !isFloat) || code[i] === 'x' || /[0-9a-fA-F]/.test(code[i]))) {
        if (code[i] === '.') isFloat = true;
        num += code[i]; i++;
      }
      tokens.push({ type: isFloat ? 'FLOAT' : 'NUMBER', value: num });
      continue;
    }

    if (/[a-zA-Z_$]/.test(code[i])) {
      let word = '';
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
        word += code[i]; i++;
      }
      tokens.push({ type: JS_KEYWORDS.has(word) ? 'KEYWORD' : 'IDENTIFIER', value: word });
      continue;
    }

    i++;
  }
  return tokens;
}

module.exports = { tokenize };
