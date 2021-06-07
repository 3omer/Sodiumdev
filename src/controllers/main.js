/* 
controllers of:
- home view
- article view
*/

const marked = require('marked')
const Article = require('../models/articles')
const Comment = require('../models/comments')
const access = require('../models/access')
const { incArtilceViews } = require('../redis')

const index = async (req, res, next) => {
  const { q } = req.query
  let articles
  try {
    if (!q || q === 'recent') {
      articles = await access.recentArticles()
    } else if (q === 'top') {
      articles = await access.getMostViewedArticles(10)
    }
    return res.render('index', { articles })
  } catch (error) {
    return next(error)
  }
}

// eslint-disable-next-line consistent-return
const article = async (req, res, next) => {
  try {
    const art = await access.getArticle(req.params.id)
    if (!art) return next(404)

    // set this blog as seen in user session
    // req.session.seen = req.session.seen ? req.session.seen.concat([req.params.id]) : [req.params.id]

    art.content = marked(art.content)
    const comments = await Comment.find({ article: art }).populate('author')

    // increment this artilce views
    incArtilceViews(art.id)
    return res.render('article', { article: art, comments })
  } catch (err) {
    next(err)
  }
}

const newComment = async (req, res) => {
  const blogID = req.params.id
  const { comment } = req.body
  const art = await Article.findOne({ blogID })
  const newCom = new Comment({ content: comment, author: req.user, article: art })
  await newCom.save()
  res.status(201).redirect(`/blog/${blogID}`)
}

module.exports = { index, article, newComment }
