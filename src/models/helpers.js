/***
 * Add DuplicateEmailError to mongoose errors
 * Manually validate Email when registering new user and rise this error on duplicate
 ***/
const mongoose = require('mongoose')
class DuplicateEmailError extends mongoose.Error {}
mongoose.Error.DuplicateEmailError = DuplicateEmailError

module.exports = mongoose.Error
