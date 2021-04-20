/**
 * Manage access to Articles and Comments
 */

const redisClient = require('../redis')
const Article = require('./articles')
const User = require('./user')
const logger = require('../utils/logger')

/**
 * read article from cache, or read from database and write it to cache
 * @param {string} blogID
 * @returns {Promise} Article model instance if found
 */
const getArticle = async (blogID) => {
  const REDIS_ITEM_KEY = `blogs:${blogID}`
  const REDIS_TTL = 15 // seconds to expire ITEM

  return new Promise((resolve) => {
    // eslint-disable-next-line consistent-return
    redisClient.get(REDIS_ITEM_KEY, async (err, rep) => {
      if (err) logger.error('getArticle()-', err.message)
      if (rep) {
        logger.info('getArtilce() - Cache hit', { blogID })
        const data = JSON.parse(rep)
        return resolve(new Article(data))
      }

      // not found, fetch from db
      const article = await Article.findOne({ blogID }).populate('author')
      if (!article) return resolve(null)

      // cache it for next reads
      redisClient.setex(REDIS_ITEM_KEY, REDIS_TTL, JSON.stringify(article), (error) => {
        if (error) logger.error('getArticle()-', err.message)
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

  return new Promise((resolve) => {
    redisClient.zrevrange('blogs:recent', 0, -1, async (err, data) => {
      if (err) logger.error(err)
      else if (data.length) {
        logger.info('recentArticles() - cache hit')
        const articles = data.map((junk) => {
          const payload = JSON.parse(junk) // payload = { blogID, content, .. , author:{..} }
          const artilce = new Article(payload)
          artilce.author = new User(payload.author)
          return artilce
        })
        return resolve(articles)
      }

      const articles = await Article.find({}).populate('author').sort({ createdAt: -1 })
      articles.forEach((article) => {
        // use createdAt time as score for sorting
        redisClient.zadd(REDIS_ITEM_KEY, article.createdAt.getTime(), JSON.stringify(article))
        redisClient.expire(REDIS_ITEM_KEY, REDIS_TTL)
      })
      return resolve(articles)
    })
  })
}
module.exports = {
  getArticle,
  recentArticles,
}
