const express = require("express");
const ctrlMain = require("../contollers/main")
const ctrlAuthor = require("../contollers/dashboard")
const ctrlAuth =  require("../contollers/auth");
const { isLoggedIn } = require("../contollers/auth");

const router = express.Router();

// home
router.get("/", ctrlMain.index);

// author dashboard 
router.get("/dashboard", ctrlAuth.isLoggedIn, ctrlAuthor.dashboard)
router.get("/dashboard/editor", ctrlAuth.isLoggedIn, ctrlAuthor.editor)
router.post("/dashboard/editor", ctrlAuth.isLoggedIn, ctrlAuthor.newArticle)

// reading 
router.get("/blog/:id", ctrlMain.article)

module.exports = router 