var express = require("express");
var fs = require("fs");
var path = require("path");
var controllersDir = path.join(process.cwd(), "./controllers");

// Get controller modules.
var files = fs.readdirSync(controllersDir);
for (var items = {}, i = 0, max = files.length; i < max; i++) {
    var filename = files[i];
    filename = filename.substr(0, filename.length - path.extname(filename).length);
    items[filename] = true;
}

// Create Router instance.
var router = express.Router();

// Set default routing configuration.
router.all("/:controller/:action/?", (request, response, next) => {
    var controller = request.params.controller || "";
    var action = request.params.action || "";
    var method = (request.method || "").toLowerCase();

    if (!items[controller]) {
        return next();
    }

    var ctrl = require(path.join(controllersDir, `./${controller}.js`));
    var mthd = ctrl.get(action, method);
    mthd.invoke(request, response);
});

// Exports module.
module.exports = router;
