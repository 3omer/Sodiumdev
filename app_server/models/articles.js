const mongoose = require("mongoose")
const { userSchema } = require("./user")
// const { userSchema } = require("./user")
// todo: add tags, likes(claps, loved), slug
const articleScehma = new mongoose.Schema({
    author: {
        _id: mongoose.Types.ObjectId,
        id: String,
        username: String,
        email: String
    },

    title: {
        type: String,
        maxlength: 50,
        minlength: 1
    },

    createdAt: {
        type: Date,
        default: () => new Date()
    },
    cover: {
        type: String,
        default: "assest/cover_placeholder.jpg"
    },
    tags: {
        type: [String]
    },

    content: {
        type: String
    }
})

articleScehma.pre("save", function() {
    this.author.id = String(this.author._id)
})

articleScehma.methods.isOwner = function(id) {
    return this.author.id === String(id) 
}

const Article = mongoose.model("Article", articleScehma)
module.exports = { Article, articleScehma }