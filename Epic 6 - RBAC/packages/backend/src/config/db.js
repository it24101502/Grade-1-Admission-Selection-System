const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../../database.sqlite");

let db = null;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  initSchema();
  return db;
}

function getDb() {
  if (!db) throw new Error("DB not initialized. Call initDb() first.");
  return db;
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      category TEXT NOT NULL,
      submitted_by INTEGER,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (submitted_by) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      score INTEGER,
      verdict TEXT,
      notes TEXT,
      judged_by INTEGER,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id),
      FOREIGN KEY (judged_by) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      verified_by INTEGER,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );
  `);
  saveDb();
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    const row = {};
    cols.forEach((c, i) => (row[c] = vals[i]));
    rows.push(row);
  }
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  db.run(sql, params);
  const idRows = query("SELECT last_insert_rowid() as id");
  const changesRows = query("SELECT changes() as changes");
  saveDb();
  return { lastInsertRowid: idRows[0]?.id ?? null, changes: changesRows[0]?.changes ?? 0 };
}

function get(sql, params = []) {
  return query(sql, params)[0] ?? null;
}

function all(sql, params = []) {
  return query(sql, params);
}

function exec(sql) {
  db.run(sql);
  saveDb();
}

module.exports = { initDb, getDb, run, get, all, exec, saveDb };
