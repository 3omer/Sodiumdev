const path = require("path")
const morgan = require("morgan")
const config = require("./utils/config")
const express = require("express")
const session = require("express-session")
const flash = require('express-flash')
const MongoStore = require("connect-mongodb-session")(session)
const middleware = require("./utils/middleware")
const ctrlAuth = require("./contollers/auth")
const ctrlMain = require("./contollers/main")
const ctrlProfile = require("./contollers/profile")
const ctrlDashboard = require("./contollers/dashboard")
require("./db")

const app = express()

// serve statics
app.use(express.static(path.join(__dirname, "public")))

// config view engine
app.set("views", path.resolve(__dirname, "views"))
app.set("view engine", "ejs")

// parse req body
app.use(express.urlencoded({ extended: false }))

const reqLog = morgan("dev")
app.use(reqLog)

// flash
app.use(flash())

// session store
const store = new MongoStore({
    uri: config.sessionStore.uri,
    collection: config.sessionStore.collection
})    
store.on("error", console.error)
app.use(session({
    name:"session",
    store: store,
    secret: config.app.secret,
    resave: false,
    saveUninitialized: false,  
}))    

// initialize passport midlleware
const passport = require("./utils/passport")
app.use(passport.initialize())
app.use(passport.session())
// make user object availble in tempelates
app.use(middleware.injectUserInLocals)

// Routes
app.get("/", ctrlMain.index)

// users auth routes
app.get("/register", ctrlAuth.register)
app.post("/register", ctrlAuth.handleRegister)
app.get("/login", ctrlAuth.login)
app.post("/login", ctrlAuth.handleLogin)
app.get("/logout", ctrlAuth.logOut)

// view article 
app.get("/blog/:id", ctrlMain.article)
app.post('/blog/:id/comments', middleware.requireAuth ,ctrlMain.newComment)

// author dashboard and blogs editor editor
app.get("/dashboard", middleware.requireAuth, ctrlDashboard.dashboard)
app.get("/dashboard/editor", middleware.requireAuth, ctrlDashboard.editor)
app.post("/dashboard/editor", middleware.requireAuth, ctrlDashboard.newArticle)
app.post("/dashboard/editor/delete/:id", middleware.requireAuth, ctrlDashboard.deleteArticle)
// profile
app.get("/me", middleware.requireAuth, ctrlProfile.me)
app.get("/users/:id", ctrlProfile.profile)

// unknown endpoint
app.use((req, res, next) => {
    next(404)
})

// handle error
app.use(middleware.errorHandler)

module.exports = app