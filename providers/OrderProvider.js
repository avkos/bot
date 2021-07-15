const LoggerService = require('../services/LoggerService')
const BaseProvider = require('./BaseProvider')

class OrderProvider extends BaseProvider {
  constructor(...p) {
    super(...p)
    const { log, error } = new LoggerService('DBOrderProvider')
    this.log = log
    this.error = error
  }

  get Model() {
    return this.models.Order
  }

  getOrderUnique(type, orderId) {
    return `${type}_${orderId}`
  }

  async getOrder(order, filter) {
    let params = {
      unique: this.getOrderUnique(order.originalOrderType || order.type, order.orderId),
    }
    if (filter) {
      params = {
        ...params,
        ...filter,
      }
    }
    return this.findOne(params)
  }

  createOrder(order) {
    return this.create({
      ...order,
      orderId: String(order.orderId),
      origQty: order.origQty || order.originalQuantity,
      price: order.price,
      avgPrice: order.averagePrice,
      unique: this.getOrderUnique(order.originalOrderType || order.type, order.orderId),
    })
  }
  async updateOrderCommission(o, trade) {
    if (trade.commission && Number(trade.commission) > 0) {
      o.commission = trade.commission
      await o.save()
    }
  }

}

module.exports = OrderProvider
