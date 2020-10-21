/* 
controllers of:
- home view
- article view
*/

const marked = require("marked")
const { Article } = require('../models/articles');
const { Mongoose } = require("mongoose");

const index = (req, res, next) => {
    
    Article.find({}).then((articles) => {
        res.render("index", { articles });
    }).catch(error => {
        next(error)
    })
}

const article = (req, res, next) => {
    Article.findOne({ blogID: req.params.id }).then (article => {
        // console.log(article)
        article.content = marked(article.content)
        res.render("article", { article: article })
    }).catch(err => next(err))
}

module.exports = { index, article }
