const info = (...params) => {
    console.log(params)
}

const error = (...params) => {
    if (process.env == "test") return
    console.error(params)
}

module.exports = {
    info,
    error
}