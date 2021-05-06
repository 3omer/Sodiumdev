const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  author: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },

  article: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Article',
  },

  content: {
    required: true,
    type: String,
  },

  createdAt: {
    type: Date,
    default: () => new Date(),
  },
})

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment
