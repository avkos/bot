const EventEmitter = require('events').EventEmitter
const LoggerService = require('../services/LoggerService')
const BaseProvider = require('./BaseProvider')

class OrderProvider extends BaseProvider{
  constructor() {
    const { log, error } = new LoggerService('DBOrderService')
    this.log = log
    this.error = error
  }
}

module.exports = OrderProvider
