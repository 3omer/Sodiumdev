const User = require('../models/user')
const Article = require('../models/articles')

const me = async (req, res) => {
  res.redirect(`/users/${req.user.id}`)
}

const profile = async (req, res, next) => {
  const { id } = req.params
  try {
    const user = await User.findById(id)
    const articles = await Article.find({ author: user.id }).populate('author')
    if (!user) return next(404)
    // is the viewr the owner of the profile -> true: display mangment options
    const isOwner = req.user ? req.user.id === id : false
    return res.render('profile', { author: user, articles, isOwner })
  } catch (error) {
    return next(500)
  }
}

module.exports = { me, profile }
