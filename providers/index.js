const BaseProvider = require('./base')
const UserProvider = require('./UserProvider')
const OrderProvider = require('./OrderProvider')
const StrategyProvider = require('./StrategyProvider')

/**
 * @param {Sequelize} sequelize
 * @param {ConsoleInterface} logger
 * @return {Promise<*>}
 */
async function defineProviders(sequelize) {
  return {
    baseProvider: new BaseProvider(sequelize),
    userProvider: new UserProvider(sequelize),
    orderProvider: new OrderProvider(sequelize),
    strategyProvider: new StrategyProvider(sequelize),
  }
}

module.exports = defineProviders
