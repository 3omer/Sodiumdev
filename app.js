const path = require("path");
const morgan = require("morgan");
const express = require("express");
require("./app_server/models/db");
const indexRouter = require("./app_server/routes/index");



const app = express();

const logger = morgan("dev");
app.use(logger);

app.use(express.static("public"));

app.set("views", path.resolve(__dirname, "app_server", "views"));
app.set("view engine", "ejs");

// register routes
app.use(indexRouter);

app.listen(3000, function() {
    console.log("Server is Listening 3000")
})