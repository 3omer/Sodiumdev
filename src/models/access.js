/**
 * Manage access to Articles and Comments
 */
const { promisify } = require('util')
const redisClient = require('../redis')
const Article = require('./articles')
const logger = require('../utils/logger')

/**
 * read article from cache, or read from database and write it to cache
 * @param {string} blogID
 * @returns {Promise} Article model instance if found
 */
const getArticle = async (blogID) => {
  // get from cache
  let article = await redisClient.getArticle(blogID)
  if (article) return article
  // fetch db
  article = await Article.findOne({ blogID }).populate('author')
  // update cache
  await redisClient.cacheArticle(article)
  return article
}

/**
 * return recently posted articles
 */
const recentArticles = async () => {
  // get from cache
  let articles = await redisClient.cacheRecentArticles()
  if (articles.length) {
    // cache hit
    return recentArticles
  }
  // cache is empty
  // fecth from DB and update cache
  articles = await Article.find({}).populate('author')
  await redisClient.setRecentArticles(articles)
  return articles
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
