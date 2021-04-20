/* eslint-disable func-names */
const mongoose = require('mongoose')
const shortid = require('shortid')

// todo: add tags, likes(claps, loved), slug
const articleScehma = new mongoose.Schema({
  blogID: {
    type: String,
    unique: true,
    default: shortid.generate,
  },

  author: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },

  title: {
    type: String,
    maxlength: 50,
    minlength: 1,
  },

  createdAt: {
    type: Date,
    default: () => new Date(),
  },

  cover: {
    type: String,
    default: 'assest/cover_placeholder.jpg',
  },

  tags: {
    type: [String],
  },

  content: {
    type: String,
  },
})

articleScehma.pre('save', function () {
  // eslint-disable-next-line no-underscore-dangle
  this.author.id = String(this.author._id)
})

articleScehma.methods.isOwner = function (id) {
  return this.author.id === String(id)
}

const Article = mongoose.model('Article', articleScehma)
module.exports = Article
