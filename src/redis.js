const redis = require('redis')
const config = require('./utils/config')
const logger = require('./utils/logger')
const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port
})

client.on('connect', () => {
    logger.info('Redis is Connected - ', config.redis)
})

client.on('error', (err) => {
    logger.error('Redis faild to connect. ', err)
})

module.exports = client