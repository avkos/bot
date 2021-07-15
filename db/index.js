const defineModels = require('../models');
const defineProviders = require('../providers');
const { Sequelize } = require('sequelize');
const config = require('../config');

async function initDB(config) {
  const sequelize = new Sequelize({
    ...config.db,
  });

  try {
    await sequelize.authenticate();
    console.info('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }

  defineModels(sequelize);

  const providers = await defineProviders(sequelize);

  return Object.freeze({
    _db: sequelize,
    models: Object.freeze(sequelize.models),
    ...providers,
    shutdown: () => sequelize.close()
  });
}

module.exports = initDB(config);
