const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const { User } = require("../models/user")

// passport auth config: verify method
passport.use(new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password"
    },
    async function (email, password, done) {
        try {
            const user = await User.findOne({ email: email })
            if (!user) return done(null, false, { message: "Invalid Credentials" })
            if (!user.verifyPassword(password)) return done(null, false, { message: "Invalid Credentials" })
            return done(null, user)
        } catch (error) {
            done(error)
        }

    }
))


const register = (req, res) => {
    res.render("register")
}

const handleRegister = async (req, res) => {
    userData = req.body
    // console.log(userData)
    try {
        const user = new User(req.body)
        await user.save()
        req.flash("info", "Welocme!")
        res.redirect("/")
    } catch (error) {
        req.flash("error", "User already exists try different email.")
        res.redirect("/register")
    }
}

const login = (req, res) => {
    res.render("login")
}

const handleLogin = async (req, res) => {
    const cred = { email: req.body.email, password: req.body.password }
    try {
        const author = await User.findByCredential(cred.email, cred.password)
        if (!author) {
            res.status(400).send("Error occured")
        }
        console.log(author)
        res.redirect("/")
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
}

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