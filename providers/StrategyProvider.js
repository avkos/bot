const LoggerService = require('../services/LoggerService')
const BaseProvider = require('./BaseProvider')
const { STRATEGY } = require('../config')

class StrategyProvider extends BaseProvider {
  constructor(...p) {
    super(...p)
    const { log, error } = new LoggerService('DBStrategyProvider')
    this.log = log
    this.error = error
  }
  get includes() {
    return {
      orders: { model: this.models.Order, as: 'orders'}
    };
  }

  get Model() {
    return this.models.Strategy
  }

  getCurrentStrategy({ symbol, userId, positionSide }) {
    return this.findOne({
      positionSide,
      symbol,
      userId,
      status: { [this.Op.in]: [STRATEGY.STATUS.WAIT_ENTRY_POINT, STRATEGY.STATUS.WAIT_ENTRY_POINT] },
    },{
      includes:[this.includes.orders]
    })
  }

}

module.exports = StrategyProvider
