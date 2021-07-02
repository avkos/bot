const BaseProvider = require('./base')
const UserProvider = require('./user')
const OrderProvider = require('./order')

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
  }
}

module.exports = defineProviders
