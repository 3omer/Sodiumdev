const path = require("path");
const morgan = require("morgan");
const config = require("./config/config")
const express = require("express");
const session = require("express-session")
const flash = require('express-flash');
const MongoStore = require("connect-mongodb-session")(session)
const passport = require("passport")
require("./app_server/models/db");
require("./config/passport")
const indexRouter = require("./app_server/routes/index");
const authRouter = require("./app_server/routes/auth")


const app = express();

const logger = morgan("dev");
app.use(logger);
app.use(express.urlencoded({ extended: false }))

// config view engine
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.resolve(__dirname, "app_server", "views"));
app.set("view engine", "ejs");

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

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


// load user
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

// register routes
app.use(authRouter)
app.use(indexRouter)


// error handling
app.use((req, res, next) => {
    next({ status: 404 })
})

// log errors then modify to display understandable enduser message
// error object: {status: Number, userMessage, ..[]}
app.use((error, req, res, next) => {
    // log the error before modifing
    console.error("Error Handler Middleware", error)
    // if the error object is just a status code
    if (Number.isInteger(error)) {
        error = { status: error }
    }
    switch (error.status) {
        case 404: {
            error.userMessage = "Resource not found. Please check the URL for typos."
            error.imgSrc = "/assest/404.svg"
            res.status(404)
            break
        }
        case 403: {
            error.userMessage = "Sorry, You don't have the permission to access this resource."
            error.imgSrc = "/assest/403.svg"
            res.status(403)
            break
        }

        case 500:
        default: {
            error.userMessage = "Sorry something went wrong. We are working on it."
            error.imgSrc = "/assest/500.svg"
            res.status(500)
            break
        }
    }

    return res.render("error", { error })
})

console.log("Env config:", config)
const PORT = config.app.port
app.listen(PORT, function () {
    console.log(`Server is Listening on ${PORT}`)
})

module.exports = app