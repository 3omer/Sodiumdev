/**
 * Manage access to Articles and Comments
 */
const logger = require('../utils/logger')
const redisStore = require('../redis')
const Article = require('./articles')

/**
 * read article from cache, or read from database and write it to cache
 * @param {string} blogID
 * @returns {Promise} Article model instance if found
 */
const getArticle = async (blogID) => {
  // get from cache
  let article = await redisStore.getArticle(blogID)
  if (article) return article
  // fetch db
  article = await Article.findOne({ blogID }).populate('author')
  // update cache
  await redisStore.cacheArticle(article)
  return article
}

/**
 * return recently posted articles
 */
const recentArticles = async () => {
  // get from cache
  let articles = await redisStore.getRecentArticles()
  if (articles.length) {
    // cache hit
    return articles
  }
  // cache is empty
  // fecth from DB and update cache
  articles = await Article.find({}).populate('author').sort({ createdAt: -1 })
  await redisStore.cacheRecentArticles(articles)
  return articles
}

const getMostViewedArticles = async (length = 10) => {
  let topArticles = []
  const cachedTopArticles = await redisStore.getMostViewedArticles(length)
  if (cachedTopArticles && cachedTopArticles.length) {
    topArticles = cachedTopArticles
  } else {
    // cache is empty, or expired
    // get new top articles ids
    const articlesIds = await redisStore.topArticlesIds(length)
    // query result from db they are NOT ORDERED
    logger.info('ids to query', articlesIds)
    const queryResult = await Article.find({
      _id: { $in: articlesIds },
    }).populate('author')
    logger.info('queryresult', queryResult.length)

    // re-order query result to match articlesIds order
    topArticles = articlesIds.map((id) => queryResult.find((article) => article.id === id))
    // update cache
    await redisStore.cacheMostViewedArticles(topArticles)
  }
  return topArticles
}

module.exports = {
  getArticle,
  recentArticles,
  getMostViewedArticles,
}
