// SQLite Client Connector
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

module.exports = db;
