// Setup passport configuration

const passport = require("passport")
const mongoose = require("mongoose")
const User = require("../models/user")
const LocalStrategy = require("passport-local").Strategy

// passport auth config: verify method
passport.use(new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password"
    },
    async function (email, password, done) {
        try {
            const user = await User.findByCredentials(email, password)
            if (!user) return done(null, false, { message: "Invalid Credentials" })
            return done(null, user)

        } catch (error) {
            done(error)
        }

    }
))

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then((user) => {
            done(null, user)
        })
        .catch(error => done(error))
})

module.exports = passport