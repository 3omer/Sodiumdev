const http = require('http')
const app = require('./src/app')
const config = require('./src/utils/config')
const logger = require('./src/utils/logger')

const server = http.createServer(app)

logger.info('Env config:', config)
const PORT = config.app.port

server.listen(PORT, function () {
  logger.info(`Server is Listening on ${PORT}`)
})
