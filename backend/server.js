import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());
app.use(cors({ origin: '*' }));

// ── Database Setup (SQLite built-in or PostgreSQL) ──────────────
let dbMode = 'sqlite';
let pgPool = null;
let sqliteDb = null;

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (process.env.DATABASE_URL) {
  dbMode = 'postgres';
  const { default: pg } = await import('pg');
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });
} else {
  dbMode = 'sqlite';
  const { DatabaseSync } = await import('node:sqlite');
  const dbFile = path.join(DATA_DIR, 'subscribers.db');
  sqliteDb = new DatabaseSync(dbFile);
}

// ── Auto-create table ──────────────────────────────────────────
async function initDB() {
  if (dbMode === 'postgres') {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id          SERIAL PRIMARY KEY,
        email       TEXT NOT NULL UNIQUE,
        role        TEXT NOT NULL,
        lang        TEXT NOT NULL DEFAULT 'fr',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
    `);
    console.log('✓ PostgreSQL ready');
  } else {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        email       TEXT NOT NULL UNIQUE,
        role        TEXT NOT NULL,
        lang        TEXT NOT NULL DEFAULT 'fr',
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
    `);
    console.log(`✓ SQLite ready (${path.join(DATA_DIR, 'subscribers.db')})`);
  }
}

// ── API Routes ────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: dbMode, timestamp: new Date().toISOString() });
});

// Subscribe
app.post('/api/subscribe', async (req, res) => {
  const { email, role, lang = 'fr' } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'email and role are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  try {
    if (dbMode === 'postgres') {
      await pgPool.query(
        `INSERT INTO subscribers (email, role, lang) VALUES ($1, $2, $3)`,
        [cleanEmail, role, lang]
      );
    } else {
      const stmt = sqliteDb.prepare(
        `INSERT INTO subscribers (email, role, lang) VALUES (?, ?, ?)`
      );
      stmt.run(cleanEmail, role, lang);
    }

    console.log(`✓ New subscriber: ${cleanEmail} (${role}, ${lang})`);
    return res.status(201).json({ success: true });
  } catch (err) {
    // Unique violation error check
    if (err.code === '23505' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
      return res.status(409).json({ error: 'duplicate email' });
    }
    console.error('Database write error:', err.message);
    return res.status(500).json({ error: 'internal server error' });
  }
});

// List subscribers (admin endpoint)
app.get('/api/subscribers', async (_req, res) => {
  try {
    if (dbMode === 'postgres') {
      const result = await pgPool.query(
        `SELECT id, email, role, lang, created_at FROM subscribers ORDER BY created_at DESC`
      );
      res.json({ count: result.rowCount, subscribers: result.rows });
    } else {
      const stmt = sqliteDb.prepare(
        `SELECT id, email, role, lang, created_at FROM subscribers ORDER BY created_at DESC`
      );
      const rows = stmt.all();
      res.json({ count: rows.length, subscribers: rows });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Serve Frontend in Single-Container Mode ───────────────────
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('✓ Serving static frontend from', distPath);
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Start Server ──────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ALLWONE Unified Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
