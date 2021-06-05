const path = require('path')
const morgan = require('morgan')
const express = require('express')
const session = require('express-session')
const connectRedis = require('connect-redis')
const flash = require('express-flash')
const redisClient = require('./redis').client
const middleware = require('./utils/middleware')
const config = require('./utils/config')
const ctrlAuth = require('./controllers/auth')
const ctrlMain = require('./controllers/main')
const ctrlProfile = require('./controllers/profile')
const ctrlDashboard = require('./controllers/dashboard')
require('./db')

const app = express()

app.use(express.json())

// serve statics
app.use(express.static(path.join(__dirname, 'public')))

// config view engine
app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'ejs')

// parse req body
app.use(express.urlencoded({ extended: false }))

const reqLog = morgan('dev')
app.use(reqLog)

// flash
app.use(flash())

// intializing redis session store
const RedisStore = connectRedis(session)

app.use(
  session({
    name: 'session',
    store: new RedisStore({ client: redisClient }),
    secret: config.app.secret,
    resave: false,
    saveUninitialized: false,
  })
)

// initialize passport midlleware
const passport = require('./utils/passport')

app.use(passport.initialize())
app.use(passport.session())

// make user object availble in tempelates
app.use(middleware.injectUserInLocals)

// Routes
app.get('/', ctrlMain.index)

// users auth routes
app.get('/register', ctrlAuth.register)
app.post('/register', ctrlAuth.handleRegister)
app.get('/login', ctrlAuth.login)
app.post('/login', ctrlAuth.handleLogin)
app.get('/logout', ctrlAuth.logOut)

// view article
app.get('/blog/:id', ctrlMain.article)
app.post('/blog/:id/comments', middleware.requireAuth, ctrlMain.newComment)

// author dashboard and blogs editor
app.get('/dashboard', middleware.requireAuth, ctrlDashboard.dashboard)
app.get('/dashboard/editor', middleware.requireAuth, ctrlDashboard.editor)
app.post('/dashboard/editor', middleware.requireAuth, ctrlDashboard.newArticle)
app.post('/dashboard/editor/delete/:id', middleware.requireAuth, ctrlDashboard.deleteArticle)

// profile
app.get('/me', middleware.requireAuth, ctrlProfile.me)
app.get('/users/:id', ctrlProfile.profile)

// handle unknown endpoint
app.use((req, res, next) => {
  next(404)
})

// handle error
app.use(middleware.errorHandler)

module.exports = app
