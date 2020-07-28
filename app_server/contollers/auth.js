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
            user.verifyPassword(password).then((isValid) => {
                if (!isValid) return done(null, false, { message: "Invalid Credentials" })
                done(null, user)
            })
        } catch (error) {
            done(error)
        }

    }
))

const register = (req, res) => {
    res.render("register")
}

const handleRegister = async (req, res) => {
    // console.log(userData)
    try {
        const user = new User(req.body)
        await user.save()
        req.flash("info", "Welocme!")
        res.redirect("/")
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
    successRedirect: "/",
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