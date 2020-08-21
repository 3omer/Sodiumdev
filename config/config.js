const env = process.env.NODE_ENV || "development"

const dev = {
    app: {
        port: 3000,
        secret: "secret"
    },
    db: {
        uri: "mongodb://localhost/sodiumdev"
    },
    sessionStore: {
        uri: "mongodb://localhost/sodiumdev",
        collection: "sessions"
    }
}

const test = {
    app: {
        port: 3000,
        secret: 'secret_test'
    },
    db: {
        uri: "mongodb://localhost/test_sodiumdev"
    },
    sessionStore: {
        uri: "mongodb://localhost/test_sodiumdev",
        collection: "sessions"
    }
}

const prod = {
    app: {
        port: process.env.PORT,
        secret: process.env.SECRET
    },
    db: {
        uri: process.env.MONGODB_URI
    },
    sessionStore: {
        uri: process.env.SESSION_STORE_URI,
        collection: process.env.SESSION_STORE_COLLECTION || "sessions"
    }
}


const config = {
    "development": dev,
    "test": test,
    "production": prod
}

module.exports = config[env]