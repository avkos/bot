const { ORDER } = require('../helpers/binance/constants')
const FutureOrder = require('../models/futureOrder')
const WS = require('./WS')
const BaseApiService = require('./BaseApiService')

class UserFuturesService extends BaseApiService {

  constructor(user) {
    super(user.bClient, user.bSecret)
    this.logPrefix = user.name
    this.user = user
    this.queue = []
    this.isRunning = false
    this.positions = []
    this.orderModel = FutureOrder
    this.ws = new WS(this.user.bClient, this.user.bSecret)
    this.ws.subscribe(this.onTrade)
    this.ws.subscribePositions(this.onPositions)
    this.ws.startListening()
    this.getActivePositions().then(positions => this.positions = positions)
  }

  async executionNEW(data) {
    try {
      await this.createDbOrder(data.order)
    } catch (e) {
      this.log('order error', e)
    }
  }

  async executionTRADE(data) {
    try {
      const { order } = data
      console.log('trade', data)
      console.log('this.orderModel',this.orderModel)
      if (order && order.orderId && order.orderStatus && order.executionType === 'TRADE') {
        const o = await this.getOrder(order)
        if (o && o.status !== order.orderStatus) {
          o.status = order.orderStatus
          console.log(`order ${order.orderId} status updated ${order.orderStatus}`)
          await this.updateOrderTrade(o, order)
        }
      }
    } catch (e) {
      this.log('executionTRADE error', e)
    }
  }

  async executionEXPIRED(data) {
    return this.executionTRADE(data)
  }

  async executionCANCELED(data) {
    return this.executionTRADE(data)
  }

  async execute(data) {
    // this.log('execute', { trader, data })
    if (data && data.order) {
      const { executionType } = data.order
      if (typeof this[`execution${executionType}`] === 'function') {
        try {
          this.log(`execution${executionType}`)
          await this[`execution${executionType}`](data)
        } catch (e) {
          this.log(`error execution${executionType}`, e)
        }
      }
    }
  }

  addToQueue(data) {
    this.queue.push(data)
  }

  runQueue() {
    if (this.isRunning) {
      return
    }
    this.isRunning = true
    this.runNext().catch(e => this.log('runQueue error', e))
  }

  async runNext() {
    if (this.queue.length === 0) {
      this.isRunning = false
      return
    }
    const data = this.queue.splice(0, 1)[0]
    await this.execute(data)
    await this.runNext()

  }

  onTrade = async (data) => {
    // this.log('add to queue', data.data.order.orderType)
    this.addToQueue(data)
    this.runQueue()
  }
  onPositions = (data) => {
    this.positions = data
  }
}

module.exports = UserFuturesService
