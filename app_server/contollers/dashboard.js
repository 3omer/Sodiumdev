/* 
controllers of:
- admin dashboard
*/
const { Article } = require("../models/articles")
const flash = require("express-flash")

// list all author articles
const dashboard = (req, res) => {
    console.log(req.method)
    res.send("a page where author review his articles")
}


// param id=123 to edit exiting article
const editor = (req, res, next) => {
    const id = req.query["edit"] || ""
    if (!id) {
        console.log("new post")
        return res.render("editor", { author: req.user, article: {} })
    } else {
        // fetch by art id then check if logged user is the autor
        Article.findOne({ _id: id }).then(article => {
            console.log(article.author.id, req.user.id)
            if (article) {
                if (!article.isOwner(req.user.id)) {
                    console.log(" found - Unauthorized")
                    flash("error", "Invalid request.")
                    return next({ status: 403 })
                }
                else {
                    console.log("found and authorized")
                    return res.render("editor", { author: req.user, article: article })
                }
            }
        }).catch(err => {
            return next(err)
        })
    }
}

// POST new Article or modify
const newArticle = async (req, res, next) => {

    const { id, title, content } = req.body
    const author = req.user
    var article
    try {
        if (id.length) {
            // update
            article = await Article.findByIdAndUpdate(id, { title, content }, { useFindAndModify: false }).then(art => article = art)
        } else {
            // create new
            article = new Article({ title: title, author: author, content: content })
            await article.save()
        }
        res.redirect(`/blog/${article.id}`)
    } catch (error) {
        return next(err)
    }
}

module.exports = { dashboard, newArticle, editor }