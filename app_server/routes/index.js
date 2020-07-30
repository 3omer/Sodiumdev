const express = require("express");
const ctrlMain = require("../contollers/main")
const ctrlAuthor = require("../contollers/dashboard")
const ctrlAuth =  require("../contollers/auth");
const { isLoggedIn } = require("../contollers/auth");

const router = express.Router();

// home
router.get("/", ctrlMain.index);

// reading 
router.get("/blog/:id", ctrlMain.article)

// author dashboard 
router.get("/dashboard", ctrlAuth.isLoggedIn, ctrlAuthor.dashboard)
router.get("/dashboard/editor", ctrlAuth.isLoggedIn, ctrlAuthor.editor)
router.post("/dashboard/editor", ctrlAuth.isLoggedIn, ctrlAuthor.newArticle)

// profile
router.get("/users/me", (req, res, next) => {
    res.send("Your profile")
})
router.get("/users/:username", (req, res, next) => {
    res.send(req.params.username)
})
module.exports = router 