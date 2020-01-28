// Bring in the scrape function
const scrape = require("../scripts/scrape")
// Bring headline and notes from the controller
const headlinesController = require("../controllers/headlines");
const notesController = require("../controllers/notes");

module.exports = function(router) {
    // This route renders homepage
    router.get("/", function(req, res) {
        res.render("home");
    });
    // This route Renders the saved handlevars page
    router.get("/saved", function(req, res) {
        res.render("saved");
    });

    router.get("/api/fetch", function(req, res) {
        headlinesController.fetch(function(err, docs) {
            if (!docs || docs.insertedCount ===0) {
                res.json({
                    message: "No new articles today. Check back later"
                });
            }
            else {
                res.json({
                    message: "Added " + docs.insertedCount + " new articles!"
                });

            }

        });

    });
    router.get("/api/headlines", function(req, res) {
        const query = {};
        if (req.query.saved) {
            query = req.query;
        }

        headlinesController.get(query, function(data){
            res.json(data);
        });

    });

    router.delete("/api/headlines/:id", function(req, res) {
        const query = {};
        query._id = req.params.id;
        headlinesController.delete(query, function(err, data){
            res.json(data);
        });

    });

    router.patch("/api/headlines", function(req, res) {
        headlinesController.update(req.body, function(err, data){
            res.json(data);
        });

    });
    router.get("/api/notes/:headline_id?", function(req, res) {
        const query = {};
        if (req.params.headline_id) {
            query._id = req.params.headline_id;
        }

        notesController.get(query, function(err, data){
            res.json(data);

        });

    });

    router.delete("/api/notes/:id", function(req, res){
        const query = {};
        query._id = req.params.id;
        notesController.delete(query, function(err, data){
            res.json(data);
        });

    });
    router.post("/api/notes", function(req, res){
        notesController.save(req.body, function(data){
            res.json(data);
        });

    });
    
}

