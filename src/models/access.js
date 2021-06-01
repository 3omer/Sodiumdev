/**
 * Manage access to Articles and Comments
 */
const { promisify } = require('util')
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

const zrevrange = promisify(redisClient.zrevrange).bind(redisClient)
// return articles' ids list ordered by views count
const mostViewdArticlesIds = async (limit) => {
  const REDIS_KEY_ARTICLES_VIEWS = 'blogs:views'
  const LENGTH = limit || 10
  const articlesIds = await zrevrange(REDIS_KEY_ARTICLES_VIEWS, 0, LENGTH - 1)
  logger.info('getMostViewed: result', articlesIds)
  return articlesIds
}

const lrange = promisify(redisClient.lrange).bind(redisClient)
const rpush = promisify(redisClient.rpush).bind(redisClient)

// get most viewed articles
const getMostViewedArticles = async (length) => {
  const REDIS_KEY_MOST_VIEWED = 'blogs:mostviewed'
  const REDIS_MOST_VIEWED_TTL = 60 // refresh every minute
  const LENGTH = length || 10

  // first get previews cached top articles
  // the list is not changed siginficientely in short times
  const cachedArticles = await lrange(REDIS_KEY_MOST_VIEWED, 0, LENGTH - 1)
  let topArticles = []
  if (cachedArticles.length) {
    logger.info('getMostViewed: cache hit')
    cachedArticles.forEach((a) => {
      const doc = JSON.parse(a)
      topArticles.push(new Article(doc))
    })
    return Promise.resolve(topArticles)
  }

  // cache is empty, or expired
  // get new top articles
  const articlesIds = await mostViewdArticlesIds(LENGTH)
  // CAUTION: they are not sorted
  const articlesRandomOrder = await Article.find({ _id: { $in: articlesIds } })
  // order
  topArticles = articlesIds.map((id) => articlesRandomOrder.find((article) => article.id === id))

  // update cache
  logger.info('getMostViewed: updating cache')
  topArticles.forEach((article) => {
    logger.info('Addin article to mostviewd cache ', article.title)
    rpush(REDIS_KEY_MOST_VIEWED, JSON.stringify(article))
  })
  // set expiration key
  redisClient.expire(REDIS_KEY_MOST_VIEWED, REDIS_MOST_VIEWED_TTL)

  return Promise.resolve(topArticles)
}

module.exports = {
  getArticle,
  recentArticles,
  getMostViewedArticles,
}
