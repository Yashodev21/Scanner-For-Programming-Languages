# 🔍 CodeScan — Multi-Language Code Scanner & Syntax Validator

A full-stack educational tool simulating the **Lexical Analysis** and **Syntax Validation** phases of a compiler frontend.

## Supported Languages
| Language   | Lexer          | Validator          |
|-----------|----------------|--------------------|
| C          | `cLexer.js`    | `cValidator.js`    |
| Java       | `javaLexer.js` | `javaValidator.js` |
| Python     | `pythonLexer.js` | `pythonValidator.js` |
| JavaScript | `jsLexer.js`   | `jsValidator.js`   |

## Features
- **Tokenization** — KEYWORD, IDENTIFIER, NUMBER, FLOAT, STRING, OPERATOR, SYMBOL
- **Syntax Validation** — per-language rules with meaningful error messages
- **Language Mismatch Detection** — detects wrong language selection
- **Multi-char Operators** — `==`, `!=`, `>=`, `<=`, `&&`, `||`, `++`, `--`, `=>`, `===`, etc.
- **Comment Stripping** — `//`, `/* */`, `#` (Python)
- **Decimal Numbers** — FLOAT token type
- **Filterable Token Table** — filter by token type
- **CSV Export** — download token data
- **Sample Code** — valid, error-containing, and mismatch examples per language

## Project Structure
```
code-scanner/
├── package.json
├── README.md
├── backend/
│   ├── server.js           ← Express server, POST /scan endpoint
│   ├── scanner.js          ← Orchestrates lexing + validation
│   ├── lexers/
│   │   ├── cLexer.js
│   │   ├── javaLexer.js
│   │   ├── pythonLexer.js
│   │   └── jsLexer.js
│   └── validators/
│       ├── cValidator.js
│       ├── javaValidator.js
│       ├── pythonValidator.js
│       └── jsValidator.js
└── frontend/
    └── index.html          ← Standalone UI (works without backend too)
```

## Quick Start

### Option A: Open directly in browser (no backend needed)
```bash
open frontend/index.html
```
The `frontend/index.html` is fully self-contained with all lexer/validator logic embedded.

### Option B: Run with Node.js backend
```bash
# Install dependencies
npm install

# Start server
npm start
# → http://localhost:3000
```


### POST /scan
**Request:**
```json
{
  "code": "int x = 10;",
  "language": "C"
}
```

**Success Response:**
```json
{
  "tokens": [
    { "type": "KEYWORD",    "value": "int",  "language": "C" },
    { "type": "IDENTIFIER", "value": "x",    "language": "C" },
    { "type": "OPERATOR",   "value": "=",    "language": "C" },
    { "type": "NUMBER",     "value": "10",   "language": "C" },
    { "type": "SYMBOL",     "value": ";",    "language": "C" }
  ]
}
```

**Error Response:**
```json
{
  "error": "Syntax Error: Missing semicolon near: \"int x = 10\""
}
```

**Mismatch Response:**
```json
{
  "error": "Error: Code does not match selected language (detected Python)"
}
```

## Token Types & Colors
| Token Type  | Example            | Color   |
|------------|-------------------|---------|
| KEYWORD    | `int`, `def`, `let` | Pink   |
| IDENTIFIER | `myVar`, `foo`    | Cyan    |
| NUMBER     | `42`, `0`         | Purple  |
| FLOAT      | `3.14`, `2.5`     | Orange  |
| STRING     | `"hello"`         | Yellow  |
| OPERATOR   | `+`, `==`, `=>`   | Red     |
| SYMBOL     | `;`, `{`, `(`     | Green   |
