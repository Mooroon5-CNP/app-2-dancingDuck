const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || '/data/quacks.db';

let db;

function getDb() {
  if (!db) {
    if (DB_PATH !== ':memory:') {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS quacks (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        lyric      TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      )
    `);
  }
  return db;
}

function saveQuack(lyric) {
  return getDb()
    .prepare('INSERT INTO quacks (lyric) VALUES (?) RETURNING id, lyric, created_at')
    .get(lyric);
}

function getRecentQuacks(limit = 20) {
  return getDb()
    .prepare('SELECT id, lyric, created_at FROM quacks ORDER BY id DESC LIMIT ?')
    .all(limit);
}

function countQuacks() {
  return getDb()
    .prepare('SELECT COUNT(*) as total FROM quacks')
    .get().total;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { saveQuack, getRecentQuacks, countQuacks, closeDb };
