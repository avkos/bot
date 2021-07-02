const NodeBinanceApi = require('node-binance-api')
const apiQueueService = require('./ApiQueueService')
const { ORDER } = require('./constants')

class BaseApiService {
  constructor(client, secret, exchangeInfo) {
    this.logPrefix = ''
    this.user = {}

    this.logger = console
    this.api = new NodeBinanceApi().options({
      APIKEY: client,
      APISECRET: secret,
      hedgeMode: true,
    })
    this.exchangeInfo = exchangeInfo || {}
  }

  log = (...props) => {
    this.logger.log(this.logPrefix, new Date().toISOString().substr(0, 19), ...props)
  }

  error = (...props) => {
    this.logger.error(this.logPrefix, new Date().toISOString().substr(0, 19), ...props)
  }

  getAssetQuantityPrecision(symbol) {
    const { symbols = [] } = this.exchangeInfo
    const s = symbols.find((s) => s.symbol === symbol) || { quantityPrecision: 3 }
    return s.quantityPrecision
  }

  getAssetPricePrecision(symbol) {
    const { symbols = [] } = this.exchangeInfo
    const s = symbols.find((s) => s.symbol === symbol) || { pricePrecision: 2 }
    return s.pricePrecision
  }

  async getOpenOrders() {
    try {
      const orders = await apiQueueService.executeInQueue(this.api.futuresOpenOrders) || []
      return orders && Array.isArray(orders) && orders.map((o) => ({ ...o, orderId: String(o.orderId) })) || []
    } catch (e) {
      this.error('getOpenOrders error', e)
      throw new Error(e)
    }
  }

  async getBalanceRaw() {
    const r = (await apiQueueService.executeInQueue(this.api.futuresBalance)) || []
    const b = r && Array.isArray(r) && r.find((s) => s.asset === 'USDT')
    return Number(b && b.balance) || 0
  }

  async getBalance() {
    try {
      return await this.getBalanceRaw()
    } catch (e) {
      this.error('error getBalance', e)
      throw new Error(e)
    }
  }

  async getPosition(symbol, positionSide) {
    const res = await this.getActivePositions(symbol)
    const position = res && Array.isArray(res) && res.filter((r) => (r.positionSide = positionSide))[0]
    return position || { positionAmount: 0, positionSide }
  }

  async getActivePositions(symbol) {
    let data
    if (symbol) {
      data = { symbol }
    }
    const res = await apiQueueService.executeInQueue(this.api.futuresPositionRisk, data)
    const positions =
      res &&
      Array.isArray(res) &&
      res
        .filter((r) => Number(Math.abs(r.positionAmt) > 0))
        .map((p) => ({
          ...p,
          positionAmount: Math.abs(p.positionAmt || p.positionAmount) || p.positionAmt || p.positionAmount || 0,
        }))
    return positions || []
  }

  async closePosition(positionSide, symbol, qty) {
    if (positionSide === ORDER.SIDE_DUAL.SHORT) {
      return this.closeShort(symbol, Number(qty))
    }
    if (positionSide === ORDER.SIDE_DUAL.LONG) {
      return this.closeLong(symbol, Number(qty))
    }
  }

  async closePositionFull(positionSide, symbol) {
    const userPosition = await this.getPosition(symbol, positionSide)
    if (positionSide === ORDER.SIDE_DUAL.SHORT) {
      return this.closeShort(symbol, Number(userPosition && userPosition.positionAmount))
    }
    if (positionSide === ORDER.SIDE_DUAL.LONG) {
      return this.closeLong(symbol, Number(userPosition && userPosition.positionAmount))
    }
  }

  closeShort(symbol, quantity) {
    this.log('closeShort', symbol, quantity)
    if (quantity > 0) {
      const params = {
        positionSide: ORDER.SIDE_DUAL.SHORT,
      }
      return this.futuresOrder(ORDER.SIDE.BUY, symbol, quantity, false, params)
    }
  }

  closeLong(symbol, quantity) {
    this.log('closeLong', symbol, quantity)
    if (Number(quantity) > 0) {
      const params = {
        positionSide: ORDER.SIDE_DUAL.LONG,
      }
      return this.futuresOrder(ORDER.SIDE.SELL, symbol, quantity, false, params)
    }
  }

  async openPosition(positionSide, symbol, quantity) {
    this.log('openPosition', positionSide, symbol, quantity)
    if (positionSide === ORDER.SIDE_DUAL.SHORT) {
      return this.openShort(symbol, Number(quantity))
    }
    if (positionSide === ORDER.SIDE_DUAL.LONG) {
      return this.openLong(symbol, Number(quantity))
    }
  }

  openShort(symbol, quantity) {
    this.log('openShort', symbol, quantity)
    if (quantity > 0) {
      const params = {
        positionSide: ORDER.SIDE_DUAL.SHORT,
      }
      return this.futuresOrder(ORDER.SIDE.SELL, symbol, quantity, false, params)
    }
  }

  openLong(symbol, quantity) {
    this.log('openLong', symbol, quantity)
    if (Number(quantity) > 0) {
      const params = {
        positionSide: ORDER.SIDE_DUAL.LONG,
      }
      this.log('open long', ORDER.SIDE.BUY, symbol, quantity, false, params)
      return this.futuresOrder(ORDER.SIDE.BUY, symbol, quantity, false, params)
    }
  }

  async futuresOrder(side, symbol, qty, price, params) {
    try {
      qty = Number(qty).toFixed(this.getAssetQuantityPrecision(symbol))
      if (price) {
        price = Number(price).toFixed(this.getAssetPricePrecision(price))
      }

      if (!params) {
        params = {}
      }
      if (!params.type) {
        params.type = ORDER.TYPE.MARKET
      }
      this.log('futuresOrder', side, symbol, qty, price || false, params)
      return await apiQueueService.executeInQueue(this.api.futuresOrder, side, symbol, qty, price || false, params)
    } catch (e) {
      this.error('futuresOrder error', e)
      throw new Error(e)
    }
  }

  async cancelDBOrder(order) {
    this.log('cancel Order', order)
    if (order && (order.orderId)) {
      const params = {}
      if (order.orderId) {
        params.orderId = String(order.orderId)
        await apiQueueService.executeInQueue(this.api.futuresCancel, order.symbol, params)
      }
    }
  }
}

module.exports = BaseApiService
