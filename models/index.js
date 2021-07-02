'use strict'
const user = require('./user')
const order = require('./order')

/**
 *
 * @param {Sequelize} sequelize
 */
// eslint-disable-next-line no-unused-vars
function defineModels(sequelize) {
  [
    order(sequelize),
    user(sequelize),
  ].map((model) => {
    if (model.associate) {
      model.associate(sequelize.models)
    }
  })
}

module.exports = defineModels
