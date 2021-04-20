/* 
controllers of:
- home view
- article view
*/

const marked = require('marked')
const Article = require('../models/articles')
const Comment = require('../models/comments')
const access = require('../models/access')

const index = (req, res, next) => {
  access
    .recentArticles()
    .then((articles) => {
      res.render('index', { articles })
    })
    .catch((error) => {
      next(error)
    })
}

// eslint-disable-next-line consistent-return
const article = async (req, res, next) => {
  try {
    const art = await access.getArticle(req.params.id)
    if (!art) return next(404)
    // set this blog as seen in user session
    // req.session.seen = req.session.seen ? req.session.seen.concat([req.params.id]) : [req.params.id]

    art.content = marked(art.content)
    const comments = await Comment.find({ art }).populate('author')
    return res.render('article', { art, comments })
  } catch (err) {
    next(err)
  }
}

const newComment = async (req, res) => {
  const blogID = req.params.id
  const { comment } = req.body
  const art = await Article.findOne({ blogID })
  const newCom = new Comment({ content: comment, author: req.user, art })
  await newCom.save()
  res.status(201).redirect(`/blog/${blogID}`)
}

module.exports = { index, article, newComment }
