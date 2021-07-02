const path = require('path')
const initConfig = require('./config')
const initDB = require('./db')

const ROOT_PATH = process.cwd();

(async function () {
  const config = await initConfig(path.resolve(ROOT_PATH, 'config'))

  const db = await initDB()
  application.services = { db, config }
  

  await application.start(true)

  logger.info('Application started')
})()
