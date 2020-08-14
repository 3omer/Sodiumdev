const mongoose = require("mongoose")
const config = require("../../config/config")

const dbURI = config.db.uri

mongoose.connect(dbURI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })

mongoose.connection.on("connected", () => {
    console.log(`Mongoose connected to ${dbURI}`)
})

mongoose.connection.on("error", (err) => {
    console.error(`Mongoose connection error: ${err}`)
})

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected")
})

const gracefulShutdown = (msg, cb) => {
    mongoose.connection.close()
        .then(() => {
            console.log(`Mongoose disconnected through: ${msg}`)
            cb()
        })
}


// app termination
process.on("SIGINT", () => {
    gracefulShutdown("app termination", () => {
        process.exit(0)
    })
})

// Nodemon restarts
process.once("SIGUSR2", () => {
    gracefulShutdown("Nodemon restart", () => {
        process.kill(process.pid, "SIGUSR2")
    })
})

// Heroku termination
process.on("SIGTERM", () => {
    gracefulShutdown("Heroku app shutdown", () => {
        process.exit(0)
    })
})

require('./articles');