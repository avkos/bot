const { STRATEGY, ORDER } = require('../constant')
const { strategyProvider, orderProvider } = require('../db')
const BaseApiService = require('./BaseApiService')

class Strategy extends BaseApiService{
  constructor(params) {
    const { symbol, user, positionSide } = params
    super(user.binanceApiKey,user.binanceApiSecret)
    this.symbol = symbol
    this.user = user
    this.positionSide = positionSide
  }

  async init() {
    await this.loadStrategy()
    await this.checkStrategy()
  }

  async checkStrategy() {
    await this.loadStrategy()
    if (this.strategy.status === STRATEGY.STATUS.WAIT_ENTRY_POINT) {
      await this.wait()
    } else if (this.strategy.status === STRATEGY.STATUS.IN_PROGRESS) {
      await this.progress()
    } else if (this.strategy.status === STRATEGY.STATUS.COMPLETED) {
      await this.complete()
    }
  }

  async wait() {
    // this should be implemented in parent strategy class
  }

  async progress() {
    // this should be implemented in parent strategy class
  }

  async cancelAllOrders() {
    if (this.strategy.orders && Array.isArray(this.strategy.orders)) {
      const prs = []
      for (const order of this.strategy.orders) {
        if (order && order.orderId &&
          ![ORDER.STATUS.FILLED, ORDER.STATUS.CANCELED, ORDER.STATUS.EXPIRED].includes(order.status)) {
          prs.push(this.cancelDBOrder(order))
        }
      }
      if (prs.length > 0) {
        await Promise.all(prs)
      }
    }
  }

  async addOrderToStrategy(order) {
    return orderProvider.createOrder({
      ...order,
      userId: this.user.id,
      strategyId: this.strategy.id,
    })
  }

  async complete() {
    this.strategy.status = STRATEGY.STATUS.COMPLETED
    await this.cancelAllOrders()
    await this.strategy.save()
    await this.loadStrategy()
  }

  async loadStrategy() {
    this.strategy = await strategyProvider.getCurrentStrategy({
      symbol: this.symbol,
      userId: this.user.id,
      positionSide: this.positionSide,
    })
    if (!(this.strategy && this.strategy.id)) {
      this.strategy = await strategyProvider.create({
        symbol: this.symbol,
        userId: this.user.id,
        positionSide: this.positionSide,
        status: STRATEGY.STATUS.WAIT_ENTRY_POINT,
      })
    }
  }

}

module.exports = Strategy



