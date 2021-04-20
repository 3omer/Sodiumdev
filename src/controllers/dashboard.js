/* 
controllers of:
- admin dashboard
*/
const Article = require('../models/articles')
const flash = require('express-flash')
const logger = require('../utils/logger')

// list all author articles
const dashboard = (req, res) => {
  logger.info(req.method)
  res.send('a page where author review/edit his articles')
}

// param id=123 to edit exiting article
const editor = (req, res, next) => {
  const id = req.query['edit'] || ''
  if (!id) {
    // logger.info("new post")
    return res.render('editor', { author: req.user, article: {} })
  } else {
    // fetch by art id then check if logged user is the autor
    Article.findOne({ blogID: id })
      .populate('author')
      .then((article) => {
        // logger.info(article.author.id, req.user.id)
        if (article) {
          if (!article.isOwner(req.user.id)) {
            logger.info(' found - Unauthorized')
            flash('error', 'Invalid request.')
            return next(403)
          } else {
            logger.info('found and authorized')
            return res.render('editor', { author: req.user, article: article })
          }
        } else {
          next(404)
        }
      })
      .catch((err) => {
        return next(err)
      })
  }
}

// POST new Article or modify
const newArticle = async (req, res, next) => {
  // when updating an article,
  // the article's id is posted with the content as hidden input
  const { id, title, content } = req.body
  const author = req.user
  var article
  try {
    if (id) {
      // update
      await Article.findOneAndUpdate(
        { blogID: id },
        { title, content },
        { useFindAndModify: false }
      )
      res.redirect('/me')
    } else {
      // create new
      article = new Article({ title: title, author: author, content: content })
      await article.save()
    }
    res.redirect(`/blog/${article.blogID}`)
  } catch (error) {
    return next(error)
  }
}

// handle post
const updateArticle = async (req, res, next) => {
  const id = req.params.id
  const { content, title } = req.body
  try {
    const article = await Article.findOne({ blogID: id })
    if (!article) return next(404)
    if (article.author.id !== req.user.id) return next(403)
    article.content = content
    article.title = title
    await article.save()
    res.redirect('/me')
  } catch (error) {
    logger.error(error)
    next(500)
  }
}

const deleteArticle = async (req, res, next) => {
  try {
    const id = req.params.id
    await Article.findOneAndDelete({ blogID: id })
    res.redirect('/me')
  } catch (error) {
    logger.error(error)
    next(500)
  }
}

module.exports = { dashboard, newArticle, editor, updateArticle, deleteArticle }
