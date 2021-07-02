require('dotenv').config()
const db = require('./database')

const { NODE_ENV = 'development' } = process.env

module.exports = {
  host: '127.0.0.1',
  db: db[NODE_ENV],
}
