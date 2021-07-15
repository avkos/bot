const LoggerService = require('../services/LoggerService')
const BaseProvider = require('./BaseProvider')

class UserProvider extends BaseProvider {
  constructor(...p) {
    super(...p)
    const { log, error } = new LoggerService('DBUserProvider')
    this.log = log
    this.error = error
  }

  get Model() {
    return this.models.User
  }

}

module.exports = UserProvider
