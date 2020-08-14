const passport = require("passport")
const { User } = require("../models/user")



const register = (req, res) => {
    res.render("register")
}

const handleRegister = async (req, res) => {
    // console.log(userData)
    try {
        const user = new User(req.body)
        await user.save()
        req.flash("info", "Welocme!")
        res.redirect("../")
    } catch (error) {
        console.error(error)
        req.flash("error", "User already exists try different email.")
        res.redirect("/register")
    }
}

const login = (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/")
    res.render("login")
}

const handleLogin = passport.authenticate('local', {
    successRedirect: "..",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome!"
})


const logOut = (req, res) => {
    req.logout()
    res.redirect("/")
}

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    } else {
        return res.redirect("/login")
    }

}

module.exports = { login, logOut, handleLogin, register, handleRegister, isLoggedIn }