import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDatabase(path) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      access_token TEXT NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      delivery_preference TEXT,
      address TEXT,
      note TEXT,
      items_json TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'awaiting_confirmation',
      notification_status TEXT NOT NULL DEFAULT 'pending',
      notification_attempts INTEGER NOT NULL DEFAULT 0,
      notification_error TEXT,
      notification_message_id TEXT,
      notification_sent_at TEXT,
      notification_last_attempt_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_notify ON bookings (notification_status);
  `);
  return db;
}
