/* 
controllers of:
- home view
- article view
*/

const marked = require("marked")
const Article = require('../models/articles')
const logger = require("../utils/logger")

const index = (req, res, next) => {
    
    Article.find({}).populate("author").then((articles) => {
        res.render("index", { articles });
    }).catch(error => {
        next(error)
    })
}

const article = (req, res, next) => {
    Article.findOne({ blogID: req.params.id }).populate("author").then (article => {
        // logger.info(article)
        article.content = marked(article.content)
        res.render("article", { article: article })
    }).catch(err => next(err))
}

module.exports = { index, article }