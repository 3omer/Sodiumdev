const { promisify } = require('util')
const redis = require('redis')
const Article = require('./models/articles')
const config = require('./utils/config')
const logger = require('./utils/logger')

const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
})

client.on('connect', () => {
  logger.info('Redis is Connected - ', config.redis)
})

client.on('error', (err) => {
  logger.error('Redis faild to connect. ', err)
})

// promisifying Redis' methods that we gonna use
const zrevrangeAsync = promisify(client.zrevrange).bind(client)
const zaddAsync = promisify(client.zadd).bind(client)
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)
const zincrbyAsync = promisify(client.zincrby).bind(client)
const lrangeAsync = promisify(client.lrange).bind(client)
const rpushAsync = promisify(client.rpush).bind(client)

/**
 * return posts list ordered by time posted desc
 */
const RECENT_ARTICLES_KEY = 'blogs:recent'
const RECENT_ARTICELS_EXP = 5 * 60 // 5 minutes

const getRecentArticles = async () =>
  zrevrangeAsync(RECENT_ARTICLES_KEY, 0, -1)
    .then((recentArticlesJson) => {
      let recentArticles = []
      if (recentArticlesJson.length) {
        logger.info(RECENT_ARTICLES_KEY, ' cache hit')
        recentArticles = recentArticlesJson.map((articleJson) => Article.fromJson(articleJson))
      }
      return Promise.resolve(recentArticles)
    })
    .catch((err) => {
      logger.error(err)
    })

const cacheRecentArticles = async (articles) =>
  Promise.all(
    articles.map((article) =>
      zaddAsync(RECENT_ARTICLES_KEY, article.createdAt.getTime(), JSON.stringify(article))
    )
  )
    .then(() => {
      client.expire(RECENT_ARTICLES_KEY, RECENT_ARTICELS_EXP)
      logger.info(RECENT_ARTICLES_KEY, ' cache updated')
    })
    .catch((err) => {
      logger.error(err)
    })

const BLOG_CACHE_KEY_PREFIX = 'blogs:' // append blog's id to this
const BLOG_CACHE_EXP = 1 * 60 * 60 // 1hr to evict a blog from cache

const getArticle = async (blogId) => {
  const BLOG_CACHE_KEY = BLOG_CACHE_KEY_PREFIX + blogId
  let article
  return getAsync(BLOG_CACHE_KEY)
    .then((articleJson) => {
      if (articleJson) {
        logger.info(BLOG_CACHE_KEY, ' cache hit')
        article = Article.fromJson(articleJson)
      }
      return Promise.resolve(article)
    })
    .catch((err) => {
      logger.error(err)
    })
}

const cacheArticle = (article) => {
  const BLOG_CACHE_KEY = BLOG_CACHE_KEY_PREFIX + article.blogID

  setAsync(BLOG_CACHE_KEY, JSON.stringify(article))
    .then(() => {
      logger.info(BLOG_CACHE_KEY, ' cache updated')
      client.expire(BLOG_CACHE_KEY, BLOG_CACHE_EXP)
    })
    .catch((err) => {
      logger.error(err)
    })
}

const ARTICLES_VIEWS_KEY = 'blogs:views'
/**
 * increament the article views counter by 1 and resolve with the new count number
 * redis ordered-set mainatain the counts as in the example ['123abcd', 5, ... ]
 * @param {string} artilceId
 */
const incArtilceViews = (artilceId) =>
  zincrbyAsync(ARTICLES_VIEWS_KEY, 1, artilceId)
    .then((views) => Promise.resolve(views))
    .catch((err) => logger.error(err))

/**
 * articles' ids list ordered by views count desc
 * @param {number} length length of the returned list
 * @returns {Array} articles' ids ordered by views DESC
 */
const topArticlesIds = async (length) => {
  const idsList = await zrevrangeAsync(ARTICLES_VIEWS_KEY, 0, length - 1)
  logger.info('topArticlesIds', idsList)
  return idsList
}

const MOST_VIEWED_KEY = 'blogs:mostviewed'
const MOST_VIEWED_EXP = 10 * 60
/**
 * return most viewed articles list from cache
 * @param {string} length determine the maximum length of the list, default to 10
 * @returns {Promise} most viewed articles list
 */
const getMostViewedArticles = async (length) => {
  const LENGTH = length || 10
  let mostViewedArticles = []
  const articlesJson = await lrangeAsync(MOST_VIEWED_KEY, 0, LENGTH - 1).catch((err) =>
    logger.error(err)
  )

  if (articlesJson.length) {
    logger.info(MOST_VIEWED_KEY, 'cache hit - lenght: ', articlesJson.length)
    mostViewedArticles = articlesJson.map((articleJson) => Article.fromJson(articleJson))
  }
  return mostViewedArticles
}

const cacheMostViewedArticles = async (articles) => {
  // cache in oreder
  const articlesJson = articles.map((article) => JSON.stringify(article))
  await rpushAsync(MOST_VIEWED_KEY, articlesJson)
  logger.info(MOST_VIEWED_KEY, ' cache updated')
  client.expire(MOST_VIEWED_KEY, MOST_VIEWED_EXP)
}

module.exports = {
  client,
  cacheRecentArticles,
  getRecentArticles,
  getArticle,
  cacheArticle,
  getMostViewedArticles,
  cacheMostViewedArticles,
  topArticlesIds,
  incArtilceViews,
}
