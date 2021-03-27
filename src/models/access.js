/**
 * Manage access to Articles and Comments
 */

const redisClient = require('../redis')
const Article = require('./articles')
const logger = require('../utils/logger')


/**
 * 
 * @param {string} blogID
 * @returns {Promise} Article model instance if found
 */
const getArticle = async (blogID) => {
    return new Promise((resolve, reject) => {
        //  get from cache
        redisClient.hget('blogs', `blog:${blogID}`, async (err, data) => {
            
            if (err) logger.error('getArticle()-', err.message)
            if (data) {
                logger.info('getArtilce() - Cache hit', { blogID })
                data = JSON.parse(data)

                return resolve(new Article(data))
            } 

            // not found ? fetch from db
            const article = await Article.findOne({ blogID: blogID }).populate("author")
            if (!article) return resolve(null)
            
            // cache it for next read
            redisClient.hset('blogs', `blog:${blogID}`, JSON.stringify(article), (err, rep) => {
                if (err) logger.error('getArticle()-', err.message)
                return resolve(article)
            })
        })
    })
}

module.exports = {
    getArticle,
}