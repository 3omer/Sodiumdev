const redisClient = require('../redis')

const incArtilceViews = (artilceId) => {
  const REDIS_KEY_ARTICLES_VIEWS = 'blogs:views'
  redisClient.zincrby(REDIS_KEY_ARTICLES_VIEWS, 1, artilceId)
}

module.exports = { incArtilceViews }
