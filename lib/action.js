var util = require("./util.js");
var settings = require("./settings.js");
var {Authorizer} = require("./authorizer.js");

/**
 * Action class
 * @constructor
 * @param   {string}        method      Http method.
 * @param   {string}        name        Action name.
 * @param   {Validator[]}   [rules]     Validation rules. If not defined, all users allowed.
 * @param   {function}      process     Executing process.
 */
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

/**
 * Invoke process.
 * @param   {Request}       request     Request object of express.
 * @param   {Response}      response    Response object of express.
 */
Action.prototype.invoke = function (request, response) {

    // Invoke access controll process.
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

/**
 * ActionInvokedOwner class.
 * This class is a "This Object" which used when call a process of an action.
 * @constructor
 * @param   {Request}       request     Request object of express.
 * @param   {Response}      response    Response object of express.
 * @param   {Controller}    controller  Controller class instance.
 * @param   {Action}        action      Action class instance.
 */
var ActionInvokedOwner = function (request, response, controller, action) {
    this.request = request;
    this.response = response;
    this.controller = controller;
    this.action = action;
};

/**
 * Respond with HTML using template engin.
 * @param   {string}        [path]      Render another view template.
 * @param   {object}        data        Object which pass to a view template.
 */
ActionInvokedOwner.prototype.view = function (path, data) {
    if (!data) {
        data = path;
        path = `./${this.controller.name}/${this.action.name}.${settings["view ext"]}`;
    }

    this.response.render(path, data);
};

/**
 * Respond with JSON string.
 * @param   {object}        data        Object which respond to.
 */
ActionInvokedOwner.prototype.json = function (data) {
    this.response.json(data);
};

/**
 * Respond redirect message.
 * @param   {string}        path        Redirect path.
 */
ActionInvokedOwner.prototype.redirect = function (path) {
    this.response.redirect(path);
};

// export module.
module.exports = Action;