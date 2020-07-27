const express = require("express");
const ctrlAuth = require("../contollers/auth")
const passport = require("passport");
const { route } = require(".");
const router = express.Router();

// auth routes
router.get("/register", ctrlAuth.register)
router.post("/register", ctrlAuth.handleRegister)
router.get("/login", ctrlAuth.login)
router.post("/login", passport.authenticate('local', {
                                                        successRedirect: "/",
                                                        failureRedirect: "/login",
                                                        failureFlash: true,
                                                        successFlash: "Welcome!"
                                                    })
)

router.get("/logout", ctrlAuth.isLoggedIn, ctrlAuth.logOut)

module.exports = router 