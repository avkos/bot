const NodeBinanceApi = require('node-binance-api')
const EventEmitter = require('events').EventEmitter
const LoggerService = require('./LoggerService')

class TradeService {
  constructor({client, secret}) {
    const { log, error } = new LoggerService('WS')
    this.log = log
    this.error = error
    this.api = new NodeBinanceApi().options({
      APIKEY: client,
      APISECRET: secret,
      hedgeMode: true,
    })
    this.events = new EventEmitter()
  }

  marginCallCallback = (data) => this.log('marginCallCallback', data)

  accountUpdateCallback = (data) => this.emitPositions(data.updateData.positions)

  orderUpdateCallback = (data) => this.emit(data)

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

  subscribe(cb) {
    this.events.on('trade', cb)
  }

  emit = (data) => {
    this.events.emit('trade', data)
  }
}

module.exports = TradeService
