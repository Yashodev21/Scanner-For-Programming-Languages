'use strict';

const PYTHON_KEYWORDS = new Set([
  'False','None','True','and','as','assert','async','await','break','class',
  'continue','def','del','elif','else','except','finally','for','from',
  'global','if','import','in','is','lambda','nonlocal','not','or','pass',
  'raise','return','try','while','with','yield','print','input','range',
  'len','int','str','float','list','dict','set','tuple','type','super',
  'self','cls','__init__','__main__'
]);

function tokenize(code) {
  const tokens = [];
  // Remove single-line comments (#)
  const lines = code.split('\n').map(line => line.replace(/#[^\n]*/, ''));
  const cleanCode = lines.join('\n');

  // Remove triple-quoted strings (simple approach)
  let processedCode = cleanCode.replace(/"""[\s\S]*?"""/g, '""').replace(/'''[\s\S]*?'''/g, "''");

  let i = 0;
  while (i < processedCode.length) {
    if (/\s/.test(processedCode[i])) { i++; continue; }

    // Triple quotes already stripped above; handle normal strings
    if (processedCode[i] === '"' || processedCode[i] === "'") {
      const quote = processedCode[i];
      let str = quote; i++;
      while (i < processedCode.length && processedCode[i] !== quote) {
        if (processedCode[i] === '\\') { str += processedCode[i]; i++; }
        str += processedCode[i]; i++;
      }
      str += quote; i++;
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

    const twoChar = processedCode.slice(i, i + 2);
    if (['**','//','+=','-=','*=','/=','%=','==','!=','>=','<=','->',':='].includes(twoChar)) {
      tokens.push({ type: 'OPERATOR', value: twoChar });
      i += 2; continue;
    }

    if ('+-*/%=><&|!~@'.includes(processedCode[i])) {
      tokens.push({ type: 'OPERATOR', value: processedCode[i] });
      i++; continue;
    }

    if (';,(){}[]:'.includes(processedCode[i])) {
      tokens.push({ type: 'SYMBOL', value: processedCode[i] });
      i++; continue;
    }

    if (/\d/.test(processedCode[i])) {
      let num = ''; let isFloat = false;
      while (i < processedCode.length && (/\d/.test(processedCode[i]) || (processedCode[i] === '.' && !isFloat))) {
        if (processedCode[i] === '.') isFloat = true;
        num += processedCode[i]; i++;
      }
      tokens.push({ type: isFloat ? 'FLOAT' : 'NUMBER', value: num });
      continue;
    }

    if (/[a-zA-Z_]/.test(processedCode[i])) {
      let word = '';
      while (i < processedCode.length && /[a-zA-Z0-9_]/.test(processedCode[i])) {
        word += processedCode[i]; i++;
      }
      tokens.push({ type: PYTHON_KEYWORDS.has(word) ? 'KEYWORD' : 'IDENTIFIER', value: word });
      continue;
    }

    i++;
  }
  return tokens;
}

module.exports = { tokenize };
