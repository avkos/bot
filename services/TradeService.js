const NodeBinanceApi = require('node-binance-api')
const LoggerService = require('./LoggerService')
const { orderProvider } = require('../db')
const AsyncQueue = require('../helpers/asynQueue')

class CheckOrderService {
  constructor({ binanceApiKey, binanceApiSecret }) {
    const { log, error } = new LoggerService('CheckOrderService')
    this.log = log
    this.error = error
    this.api = new NodeBinanceApi().options({
      APIKEY: binanceApiKey,
      APISECRET: binanceApiSecret,
      hedgeMode: true,
    })
    this.asyncQueue = new AsyncQueue()
  }

  checkOrder = async (data)=>{
    if (data && data.order) {
      try {
        const { order } = data
        if (order && order.orderId && order.orderStatus && order.executionType === 'TRADE') {
          const o = await orderProvider.getOrder(order)
          if (o && o.status !== order.orderStatus) {
            o.status = order.orderStatus
            await orderProvider.updateOrderCommission(o, order)
          }
        }
      } catch (e) {
        this.log('executionTRADE error', e)
      }
    }
  }
  orderUpdateCallback = (data) => {
    this.asyncQueue.emitInQueue(this.checkOrder, data)
  }

  marginCallCallback = (data) => this.log('marginCallCallback', data)
  accountUpdateCallback = (data) => this.log('accountUpdateCallback', data)
  subscribedCallback = (data) => this.log('subscribedCallback', data)
  accountConfigUpdateCallback = (data) => this.log('accountConfigUpdateCallback', data)

  startListening() {
    this.api.websockets.userFutureData(
      this.marginCallCallback,
      this.accountUpdateCallback,
      this.orderUpdateCallback,
      this.subscribedCallback,
      this.accountConfigUpdateCallback,
    )
  }
}

module.exports = CheckOrderService
