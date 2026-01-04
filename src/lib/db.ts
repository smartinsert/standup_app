import Database from 'better-sqlite3';
import path from 'path';

// Construct the path to the database file.
// In development, this will be in the project root.
const dbPath = path.join(process.cwd(), 'standup.db');

// Initialize the database
const db = new Database(dbPath);

// Create the team_members table
db.exec(`
  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    region TEXT NOT NULL,
    role TEXT DEFAULT 'member', -- 'admin' or 'member'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create/Update the standups table
db.exec(`
  CREATE TABLE IF NOT EXISTS standups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT, -- Keeping for backward compatibility or simple display
    yesterday TEXT,
    today TEXT,
    blockers TEXT,
    date TEXT, -- YYYY-MM-DD
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES team_members(id)
  )
`);

// Indexes for performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_standups_user_date ON standups(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_members_region ON team_members(region);
`);

// Migration Helper (Self-healing for existing DB)
try {
  const columns = db.pragma('table_info(standups)') as { name: string }[];
  const hasUserId = columns.some(c => c.name === 'user_id');
  const hasDate = columns.some(c => c.name === 'date');

  if (!hasUserId) {
    db.exec("ALTER TABLE standups ADD COLUMN user_id INTEGER REFERENCES team_members(id)");
  }
  if (!hasDate) {
    db.exec("ALTER TABLE standups ADD COLUMN date TEXT");
    // Backfill date from created_at for existing records
    db.exec("UPDATE standups SET date = strftime('%Y-%m-%d', created_at) WHERE date IS NULL");
  }
} catch (e) {
  console.error("Migration error (safe to ignore if fresh):", e);
}

export default db;
