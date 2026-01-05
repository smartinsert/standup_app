import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'standup.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    region TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    password TEXT DEFAULT 'password123',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS standups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT,
    yesterday TEXT,
    today TEXT,
    blockers TEXT,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES team_members(id)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_standups_user_date ON standups(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_members_region ON team_members(region);
`);

try {
  const columns = db.pragma('table_info(standups)') as { name: string }[];
  const hasUserId = columns.some(c => c.name === 'user_id');
  const hasDate = columns.some(c => c.name === 'date');
  
  const memberColumns = db.pragma('table_info(team_members)') as { name: string }[];
  const hasPassword = memberColumns.some(c => c.name === 'password');

  if (!hasPassword) {
    db.exec("ALTER TABLE team_members ADD COLUMN password TEXT DEFAULT 'password123'");
  }

  if (!hasUserId) {
    db.exec("ALTER TABLE standups ADD COLUMN user_id INTEGER REFERENCES team_members(id)");
  }
  if (!hasDate) {
    db.exec("ALTER TABLE standups ADD COLUMN date TEXT");
    db.exec("UPDATE standups SET date = strftime('%Y-%m-%d', created_at) WHERE date IS NULL");
  }
} catch (e) {
  console.error("Migration error (safe to ignore if fresh):", e);
}

export default db;
