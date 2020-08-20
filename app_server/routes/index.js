const express = require("express");
const ctrlMain = require("../contollers/main")
const ctrlAuthor = require("../contollers/dashboard")
const ctrlAuth =  require("../contollers/auth");
const { isLoggedIn } = require("../contollers/auth");
const ctrlProfile = require("../contollers/profile")

const router = express.Router();

// home
router.get("/", ctrlMain.index);

// reading 
router.get("/blog/:id", ctrlMain.article)

// author dashboard 
router.get("/dashboard", ctrlAuth.isLoggedIn, ctrlAuthor.dashboard)
router.get("/dashboard/editor", ctrlAuth.isLoggedIn, ctrlAuthor.editor)
router.post("/dashboard/editor", ctrlAuth.isLoggedIn, ctrlAuthor.newArticle)
// router.post("/dashboard/editor/update/:id", ctrlAuth.isLoggedIn, ctrlAuthor.updateArticle)
router.post("/dashboard/editor/delete/:id", ctrlAuth.isLoggedIn, ctrlAuthor.deleteArticle)

// profile
router.get("/me", ctrlAuth.isLoggedIn, ctrlProfile.me )
router.get("/users/:id", ctrlProfile.profile )
module.exports = router 