const Database = require('better-sqlite3');
const db = new Database('standup.db');

console.log('Clearing all data...');

db.prepare('DELETE FROM standups').run();
db.prepare('DELETE FROM team_members').run();
// Reset Auto Increment
db.prepare('DELETE FROM sqlite_sequence WHERE name="standups" OR name="team_members"').run();

console.log('Database cleared.');
