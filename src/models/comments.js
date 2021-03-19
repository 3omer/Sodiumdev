const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },

    article: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Article'
    },

    content: {
        type: String,
    },

    createdAt: {
        type: Date,
        default: () => new Date()
    }
})

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment