// Setup passport configuration

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')

// passport auth config: verify method
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findByCredentials(email, password)
        if (!user) return done(null, false, { message: 'Invalid Credentials' })
        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user)
    })
    .catch((error) => done(error))
})

module.exports = passport
