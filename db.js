const { UniqueConstraintError } = require('sequelize')
const { sequelize, User } = require('./models')

function isDatabaseConfigured() {
  const dbPassword = process.env.DB_PASS ?? process.env.DB_PASSWORD

  return Boolean(
    process.env.DB_HOST &&
      process.env.DB_USER &&
      dbPassword !== undefined &&
      process.env.DB_NAME
  );
}

async function validateDatabaseConnection() {
  if (!isDatabaseConfigured()) {
    throw new Error('Database is not configured. Check .env values.')
  }

  await sequelize.authenticate()
}

async function initializeDatabase() {
  await validateDatabaseConnection()

  const seedUsername = process.env.LOGIN_USERNAME || 'user1'
  const seedPassword = process.env.LOGIN_PASSWORD || 'mypassword'

  // Migration-first workflow: no sync() calls. Table creation happens in migrations.
  await User.findOrCreate({
    where: { username: seedUsername },
    defaults: {
      password: seedPassword
    }
  })
}

async function authenticateUser(username, password) {
  await validateDatabaseConnection()

  const normalizedUsername = username?.trim()

  const user = await User.findOne({
    attributes: ['user_id', 'username', 'isAdmin'],
    where: {
      username: normalizedUsername,
      password
    }
  })

  if (!user) {
    return null
  }

  return { user_id: user.user_id, username: user.username, isAdmin: user.isAdmin || false }
}

async function registerUser(username, password) {
  await validateDatabaseConnection()

  const normalizedUsername = username?.trim()
  const trimmedPassword = password?.trim()

  if (!normalizedUsername || !trimmedPassword) {
    throw new Error('Username and password are required.')
  }

  try {
    const user = await User.create({
      username: normalizedUsername,
      password
    })

    return { user_id: user.user_id, username: user.username }
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return null
    }

    throw error
  }
}

function getDatabaseErrorDetails(error) {
  return {
    message: error.message,
    code: error.code || null,
    errno: error.errno || null,
    sqlState: error.sqlState || null
  }
}

module.exports = {
  isDatabaseConfigured,
  validateDatabaseConnection,
  initializeDatabase,
  authenticateUser,
  registerUser,
  getDatabaseErrorDetails
}
