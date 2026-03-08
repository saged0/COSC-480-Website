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
  const seedUsername = process.env.LOGIN_USERNAME || 'user1';
  const seedPassword = process.env.LOGIN_PASSWORD || 'mypassword';

  try {
    await connection.ping();
    await connection.query(
      `CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )`
    );

    // Seed one login account for local development if it does not already exist.
    await connection.execute(
      'INSERT IGNORE INTO users (username, password) VALUES (?, ?)',
      [seedUsername, seedPassword]
    );
  } finally {
    connection.release();
  }
}

async function authenticateUser(username, password) {
  const databasePool = getPool();
  const [rows] = await databasePool.execute(
    'SELECT username FROM users WHERE username = ? AND password = ? LIMIT 1',
    [username, password]
  );

  return rows[0] || null;
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
  isDatabaseConfigured,
  initializeDatabase,
  authenticateUser,
  getDatabaseErrorDetails
};
