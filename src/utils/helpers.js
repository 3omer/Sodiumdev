const { getArticleViewsCount } = require('../redis')

/**
 * transform linear list of vlaue scores to list of object eg. [{value: 'my value', score: 3}]
 * @param {Array} list linear list of values and scores
 * @returns list of value-score pairs
 */
const transformRedisRange = (list, options = { dataKey: 'data', scoreKey: 'score' }) => {
  const dataKey = options.dataKey ? options.dataKey : 'data'
  const scoreKey = options.scoreKey ? options.scoreKey : 'score'

  const structuredList = []
  let obj = {}
  list.forEach((dataOrScore, index) => {
    // odd index identicates a score
    if (index % 2 === 0) obj[dataKey] = dataOrScore
    else {
      obj[scoreKey] = dataOrScore
      structuredList.push(obj)
      obj = {}
    }
  })
  return structuredList
}

const populateArticlesViews = async (articles) => {
  const promises = articles.map((artilce) => getArticleViewsCount(artilce.id))
  const views = await Promise.all(promises)
  return articles.map((artilce, index) => {
    artilce.views = views[index]
    return artilce
  })
}
module.exports = { transformRedisRange, populateArticlesViews }
