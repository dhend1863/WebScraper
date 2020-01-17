module.exports = function(router) {
    // This route renders homepage
    router.get("/", function(req, res) {
        res.render("home");
    });
    // This route Renders the saved handlevars page
    router.get("/saved", function(req, res) {
        res.render("saved");
    });



}