/**
 * Manage access to Articles and Comments
 */

const redisClient = require('../redis')
const Article = require('./articles')
const logger = require('../utils/logger')

/**
 * read article from cache, or read from database and write it to cache
 * @param {string} blogID
 * @returns {Promise} Article model instance if found
 */
const getArticle = async (blogID) => {
  const REDIS_ITEM_KEY = `blogs:${blogID}`
  const REDIS_TTL = 15 // seconds to expire ITEM

  return new Promise((resolve, reject) => {
    redisClient.get(REDIS_ITEM_KEY, async (err, data) => {
      if (err) logger.error('getArticle()-', err.message)
      if (data) {
        logger.info('getArtilce() - Cache hit', { blogID })
        data = JSON.parse(data)
        return resolve(new Article(data))
      }

      // not found, fetch from db
      const article = await Article.findOne({ blogID: blogID }).populate('author')
      if (!article) return resolve(null)

      // cache it for next reads
      redisClient.setex(REDIS_ITEM_KEY, REDIS_TTL, JSON.stringify(article), (err, rep) => {
        if (err) logger.error('getArticle()-', err.message)
        return resolve(article)
      })
    })
  })
}

/**
 * return recently posted articles
 */
const recentArticles = async () => {
  const REDIS_ITEM_KEY = 'blogs:recent'
  const REDIS_TTL = 15

  return new Promise((resolve, reject) => {
    redisClient.zrevrange('blogs:recent', 0, -1, async (err, data) => {
      if (err) logger.error(err)
      else if (data.length) {
        logger.info('recentArticles() - cache hit')
        return resolve(data.map((artilce) => new Article(JSON.parse(artilce))))
      }

      const articles = await Article.find({}).populate('author')
      articles.forEach((article) => {
        // use createdAt time as score for sorting
        redisClient.zadd(REDIS_ITEM_KEY, article.createdAt.getTime(), JSON.stringify(article))
        redisClient.expire(REDIS_ITEM_KEY, REDIS_TTL)
      })
      resolve(articles)
    })
  })
}
module.exports = {
  getArticle,
  recentArticles,
}
