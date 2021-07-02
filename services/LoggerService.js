class LoggerService {
  constructor(prefix) {
    this.logPrefix = prefix
  }

  log(...props) {
    console.log(new Date().toISOString().substr(0, 19), this.logPrefix, ...props)
  }

  error(...props) {
    console.error(new Date().toISOString().substr(0, 19), this.logPrefix, ...props)
  }
}

module.exports = LoggerService
