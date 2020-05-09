const express = require("express");
const ctrlMain = require("../contollers/main")

const router = express.Router();

router.get("/", ctrlMain.index);

router.get("/:id", ctrlMain.article)


module.exports = router 