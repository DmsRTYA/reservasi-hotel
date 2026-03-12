import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_PATH = path.join(dataDir, 'hotel.db');
let _db = null;

export default function getDb() {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      role       TEXT DEFAULT 'staff',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nama_tamu       TEXT NOT NULL,
      email           TEXT NOT NULL,
      telepon         TEXT NOT NULL,
      no_identitas    TEXT NOT NULL,
      jenis_kamar     TEXT NOT NULL,
      jumlah_kamar    INTEGER NOT NULL DEFAULT 1,
      check_in        TEXT NOT NULL,
      check_out       TEXT NOT NULL,
      jumlah_tamu     INTEGER NOT NULL DEFAULT 1,
      status          TEXT NOT NULL DEFAULT 'Booking',
      permintaan      TEXT DEFAULT '',
      total_harga     INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );
  `);
  return _db;
}
