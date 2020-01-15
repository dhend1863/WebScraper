// require dependecies
const express = require("express");
const mongoose = require("mongoose");
const expressHandlebars = require("express-handlebars");

// Set up our port 
const PORT = process.env.PORT || 3000;

// Instantiate our Express App
const app = express();

// Set up an Express Router
const router = express.Router();

// Designate our public folder as a static directory
app.use(express.static(__dirname + "/public"));

// Connect Handlebars to Express
app.engine("handlebars", expressHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Request Go Through Middleware
app.use(router);

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines Database
const db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect mongoose to our database
mongoose.connect(db, function(error) {
    // Log any errors connecting with mongoose
    if (error) {
        console.log(error);
    }
    // Or log Success Message
    else {
        console.log("Mongoose Connection is Successful");
    }
});

// Listen on Port 
app.listen(PORT, function() {
    console.log("Listening on port:" + PORT);
});