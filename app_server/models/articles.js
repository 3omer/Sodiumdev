const mongoose = require("mongoose")
const { userSchema } = require("./user")
// todo: add tags, likes(claps, loved), slug
const articleScehma = new mongoose.Schema({

    author: {
        type: userSchema,
        required: true,
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

const Article = mongoose.model("Article", articleScehma)
module.exports = { Article }