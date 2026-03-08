const mysql = require('mysql2/promise');

let pool;

function isDatabaseConfigured() {
  return Boolean(
    process.env.DB_HOST &&
      process.env.DB_USER &&
      process.env.DB_PASSWORD !== undefined &&
      process.env.DB_NAME
  );
}

function getPool() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
}

async function initializeDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error('Database is not configured. Check .env values.');
  }

  const databasePool = getPool();
  const connection = await databasePool.getConnection();

  try {
    await connection.ping();
    await connection.query(
      `CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );
  } finally {
    connection.release();
  }
}

function getDatabaseErrorDetails(error) {
  return {
    message: error.message,
    code: error.code || null,
    errno: error.errno || null,
    sqlState: error.sqlState || null
  };
}

module.exports = {
  getPool,
  isDatabaseConfigured,
  initializeDatabase,
  getDatabaseErrorDetails
};