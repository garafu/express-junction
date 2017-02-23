var util = require("./util.js");
var {Authorizer, allow} = require("./authorizer.js");

/**
 * Controller class.
 * @constructor
 * @param   {string}        name            Controller name.
 * @param   {Authorizer}    [authorizer]    Controller's authorizetion rule. Default is all users allwed.
 */
var Controller = function (name, authorizer) {
    this.name = name;
    this.authorizer = authorizer ? authorizer : new Authorizer([allow({ users: "*" })]);
    this.actions = {};
};

/**
 * Add action.
 * @param   {Action}        action          Action class.
 */
Controller.prototype.add = function (action) {
    if (!action || !action.name) {
        throw new Error;
    }
    // Update action's authorizer.
    action.controller = this;
    action.authorizer = action.authorizer ? action.authorizer : this.authorizer;

    // Append specified action to the hash map named "actions".
    var item;
    if (this.actions[action.name]) {
        item = this.actions[action.name];
    } else {
        item = this.actions[action.name] = {};
    }
    item[action.method] = action;
};

/**
 * Get action class.
 * @param   {string}        name            Action name.
 * @param   {string}        method          Http method name.
 * @return  {Action}
 */
Controller.prototype.get = function (name, method) {
    return this.actions[name][util.normalizeMethodName(method)];
};

// export module.
module.exports = Controller;