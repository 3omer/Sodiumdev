const passport = require("passport")
const { User } = require("../models/user")
const MongooseError = require("../models/helpers")



const register = (req, res) => {
    res.render("register")
}

const handleRegister = async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        req.flash("info", "Registerd Successfully !")
        res.redirect(201, "/")
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            req.flash("error", "Invalid data. Make sure to follow instruction below form fields.")
        }
        if (error instanceof MongooseError.DuplicateEmailError) {
            req.flash("error", `This email address is already registerd.
            Try a different email or Login.`)
        }
        // console.error(error)
        res.status(400).render("register")
    }
}

const login = (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/")
    res.render("login")
}

const handleLogin = passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome !",
})


const logOut = (req, res) => {
    req.logout()
    res.redirect("/")
}

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    } else {
        return res.redirect(403, "/login")
    }

}

module.exports = { login, logOut, handleLogin, register, handleRegister, isLoggedIn }