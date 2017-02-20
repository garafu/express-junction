var util = require("./util.js");
var {Authorizer, allow} = require("./authorizer.js");

var Controller = function (name, authorizer) {
    this.name = name;
    this.authorizer = authorizer ? authorizer : new Authorizer([allow({ users: "*" })]);
    this.actions = {};
};

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

Controller.prototype.get = function (name, method) {
    return this.actions[name][util.normalizeMethodName(method)];
};

module.exports = Controller;