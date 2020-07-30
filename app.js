const path = require("path");
const morgan = require("morgan");
const express = require("express");
const session = require("express-session")
const passport = require("passport")
const flash = require('express-flash');
const MongoStore = require("connect-mongodb-session")(session)
require("./app_server/models/db");
const indexRouter = require("./app_server/routes/index");
const authRouter = require("./app_server/routes/auth")
const { User } = require("./app_server/models/user");


const app = express();

const logger = morgan("dev");
app.use(logger);

app.use(express.urlencoded({ extended: false }))

// config view engine
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.resolve(__dirname, "app_server", "views"));
app.set("view engine", "ejs");

//TODO : read store config from env
// config passport
const store = new MongoStore({
    uri: process.env.MONGODB_URI,
    databaseName: "sodiumdev",
    collection: "sessions"
})
store.on("error", console.error)

app.use(session({
    store: store,
    secret: "deepSecret",
    resave: true,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
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

app.use(flash())

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

// error object {status: Number, ...}
app.use((error, req, res, next) => {
    console.error("Error Handler Middleware", error)
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

        default: {
            error.userMessage = "Sorry something went wrong. We are working on it."
            error.imgSrc = "/assest/500.svg"
            res.status(500)
        }
    }

    return res.render("error", { error })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Server is Listening on ${PORT}`)
})
