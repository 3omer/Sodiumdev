/* 
controllers of:
- home view
- article view
*/

const marked = require("marked")
const Article = require('../models/articles')
const Comment = require('../models/comments')
const access = require('../models/access')
const logger = require("../utils/logger")

const index = (req, res, next) => {

    access.recentArticles().then((articles) => {
        res.render("index", { articles });
    }).catch(error => {
        next(error)
    })
}

const article = async (req, res, next) => {
    try {

        const article = await access.getArticle(req.params.id)
        if(!article) return next(404)
        // set this blog as seen in user session
        req.session['seen'] = req.session['seen'] ? req.session['seen'].concat([req.params.id]) : [req.params.id]

        article.content = marked(article.content)
        const comments = await Comment.find({ article: article }).populate('author')
        res.render("article", { article, comments })
    }
    catch (err) {
        next(err)
    }
}

const newComment = async (req, res, next) => {
    const blogID = req.params['id']
    console.log(blogID);

    const { comment } = req.body
    const article = await Article.findOne({ blogID: blogID })
    const newComment = new Comment({ content: comment, author: req.user, article: article })
    await newComment.save()
    res.status(201).redirect(`/blog/${blogID}`)
}

module.exports = { index, article, newComment }