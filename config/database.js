const { Sequelize } = require('sequelize')

function createSequelizeInstance() {
  const dbPassword = process.env.DB_PASS ?? process.env.DB_PASSWORD
  const isDevelopment = (process.env.NODE_ENV || 'development') === 'development'

  return new Sequelize(process.env.DB_NAME, process.env.DB_USER, dbPassword, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
      max: Number(process.env.DB_POOL_MAX || 10),
      min: Number(process.env.DB_POOL_MIN || 0),
      idle: Number(process.env.DB_POOL_IDLE || 10000)
    },
    logging: isDevelopment ? console.log : false
  })
}

module.exports = createSequelizeInstance
