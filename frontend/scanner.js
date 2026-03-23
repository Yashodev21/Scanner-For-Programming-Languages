'use strict';

const cLexer      = require('./lexers/cLexer');
const javaLexer   = require('./lexers/javaLexer');
const pythonLexer = require('./lexers/pythonLexer');
const jsLexer     = require('./lexers/jsLexer');

const cValidator      = require('./validators/cValidator');
const javaValidator   = require('./validators/javaValidator');
const pythonValidator = require('./validators/pythonValidator');
const jsValidator     = require('./validators/jsValidator');

const LEXERS = {
  C:      cLexer,
  JAVA:   javaLexer,
  PYTHON: pythonLexer,
  JS:     jsLexer,
};

const VALIDATORS = {
  C:      cValidator,
  JAVA:   javaValidator,
  PYTHON: pythonValidator,
  JS:     jsValidator,
};

function scan(code, language) {
  const lang = language.toUpperCase();

  if (!LEXERS[lang]) {
    return { error: `Unsupported language: ${language}` };
  }

  // Step 1: Validate (includes mismatch detection)
  const validator = VALIDATORS[lang];
  const validationResult = validator.validate(code);

  if (validationResult.mismatch) {
    return { error: validationResult.error };
  }

  if (validationResult.errors && validationResult.errors.length > 0) {
    return { error: validationResult.errors[0], allErrors: validationResult.errors };
  }

  // Step 2: Tokenize
  const lexer = LEXERS[lang];
  const tokens = lexer.tokenize(code);

  if (tokens.length === 0) {
    return { error: 'No tokens found. Please enter valid code.' };
  }

  // Attach language to each token
  const annotatedTokens = tokens.map(t => ({ ...t, language: lang }));

  return { tokens: annotatedTokens };
}

module.exports = { scan };
