const dotenv = require('dotenv')

dotenv.config()

const dbPassword = process.env.DB_PASS ?? process.env.DB_PASSWORD

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: dbPassword,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  test: {
    username: process.env.DB_USER,
    password: dbPassword,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  production: {
    username: process.env.DB_USER,
    password: dbPassword,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || 'mysql'
  }
}
