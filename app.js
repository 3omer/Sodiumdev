const path = require("path");
const morgan = require("morgan");
const express = require("express");
const session = require("express-session")
const passport = require("passport")
const flash = require('connect-flash');
const MongoStore = require("connect-mongodb-session")(session)
require("./app_server/models/db");
const indexRouter = require("./app_server/routes/index");
const authRouter = require("./app_server/routes/auth")
const { use } = require("marked");
const { User } = require("./app_server/models/user");
const { decodeBase64 } = require("bcryptjs");
const { Mongoose } = require("mongoose");


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
const store = new MongoStore({ databaseName: "sodiumdev", collection: "sessions" })
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
        .then((user) =>{
            done(null, user)
        } )
        .catch(error => done(error))

})

app.use(flash())

app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

// register routes
app.use(indexRouter);
app.use(authRouter)



// error handling
app.use((err, req, res, next) => {
    console.log(err)
    res.send("smth went wrong.")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Server is Listening on ${PORT}`)
})
