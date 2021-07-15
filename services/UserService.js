const FutureOrder = require('../models/futureOrder')
const NodeBinanceApi = require('node-binance-api')
const TradeService = require('./TradeService')
const { orderProvider, userProvider } = require('../db')

class UserService {

  constructor(user) {
    this.user = user
    this.positions = []
    this.orderModel = FutureOrder
    this.tradeService = new TradeService(user)

    this.api = new NodeBinanceApi().options({
      APIKEY: user.binanceApiKey,
      APISECRET: user.binanceApiSecret,
      hedgeMode: true,
    })
  }

  init = async () => {
    this.exchangeInfo = await this.api.futuresExchangeInfo()
  }
}

module.exports = UserService
