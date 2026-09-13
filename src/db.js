const Database = require('better-sqlite3');
const path = require('path');

// Use separate database for tests
const dbPath = process.env.NODE_ENV === 'test'
  ? path.join(__dirname, '..', 'dealfinder.test.db')
  : path.join(__dirname, '..', 'dealfinder.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables if they don't exist
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      discount_percentage REAL,
      original_price REAL,
      deal_price REAL,
      source TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
};

initDb();

module.exports = db;
