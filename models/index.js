const { Sequelize } = require('sequelize');
const createSequelizeInstance = require('../config/database');

const sequelize = createSequelizeInstance();

const User = require('./user')(sequelize, Sequelize.DataTypes);
const Event = require('./event')(sequelize, Sequelize.DataTypes);
const Ticket = require('./ticket')(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  Sequelize,
  User,
  Event,
  Ticket,
};

Object.values(db).forEach((model) => {
  if (model && typeof model.associate === 'function') {
    model.associate(db);
  }
});

module.exports = db;
