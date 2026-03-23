'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const scanner = require('./scanner');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── POST /scan ──────────────────────────────────────────────────────────────
app.post('/scan', (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'No code provided' });
  }
  if (!language || typeof language !== 'string') {
    return res.status(400).json({ error: 'No language selected' });
  }

  try {
    const result = scanner.scan(code.trim(), language.trim());
    return res.json(result);
  } catch (err) {
    console.error('Scanner error:', err);
    return res.status(500).json({ error: 'Internal server error during scanning' });
  }
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Fallback ──────────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🔍 Code Scanner running on http://localhost:${PORT}\n`);
});

module.exports = app;
