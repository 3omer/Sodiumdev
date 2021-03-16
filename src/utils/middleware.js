const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    } else {
        return res.redirect(403, "/login")
    }
}

// load user
const injectUserInLocals = (req, res, next) => {
    res.locals.user = req.user
    next()
}

// map error code to convenient error page with user friendly message
// from your controllers pass res status code only eg. next(403) or { status: 403 }
const errorHandler = (error, req, res, next) => {
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
}

module.exports = {
    requireAuth,
    errorHandler,
    injectUserInLocals
}