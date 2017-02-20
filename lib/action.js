var util = require("./util.js");
var settings = require("./settings.js");
var {Authorizer} = require("./authorizer.js");

var Action = function (method, name, rules, process) {
    if (!process) {
        process = rules;
        rules = undefined; //[allow({ users: "*" })];
    }

    this.controller = null;
    this.method = util.normalizeMethodName(method);
    this.name = name;
    this.authorizer = rules ? new Authorizer(rules) : undefined;
    this.process = process;
};

Action.prototype.invoke = function (request, response) {

    // Invoke access controll process.
    // if (this.authorizer && this.authorizer.validate() === false) {
    //     return response.sendStatus(403);
    // }
    if (this.authorizer) {
        var valid = false;
        settings.authorize(request, (error, username, roles) => {
            valid = this.authorizer.validate(request, username, roles);
        });
        if (valid === false) {
            return response.sendStatus(403);
        }
    }

    // Invoke main process.
    var me = new ActionInvokedOwner(request, response, this.controller, this);
    this.process.call(me, request, response);
};

var ActionInvokedOwner = function (request, response, controller, action) {
    this.request = request;
    this.response = response;
    this.controller = controller;
    this.action = action;
};

ActionInvokedOwner.prototype.view = function (path, data) {
    if (!data) {
        data = path;
        path = `./${this.controller.name}/${this.action.name}.${settings["view ext"]}`;
    }

    this.response.render(path, data);
};

ActionInvokedOwner.prototype.json = function (data) {
    this.response.json(data);
};

ActionInvokedOwner.prototype.redirect = function (path) {
    this.response.redirect(path);
};

module.exports = Action;