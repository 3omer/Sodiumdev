const mongoose = require("mongoose")
const config = require("./utils/config")
const logger = require("./utils/logger")

const dbURI = config.db.uri

mongoose.connect(dbURI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })

mongoose.connection.on("connected", () => {
    logger.info('Mongoose connected to: ',
        mongoose.connection.host,
        mongoose.connection.name)
})

mongoose.connection.on("error", (err) => {
    logger.error(`Mongoose connection error: ${err}`)
    process.exit(1)
})

mongoose.connection.on("disconnected", () => {
    logger.info("Mongoose disconnected")
})

const gracefulShutdown = (msg, cb) => {
    mongoose.connection.close()
        .then(() => {
            logger.info(`Mongoose disconnected through: ${msg}`)
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

require("./models/user")
require("./models/articles")