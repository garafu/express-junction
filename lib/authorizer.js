var Validator = require("./validator.js");

/**
 * @param   {Validator[]}   validators
 */
var Authorizer = function (validators) {
    this.validators = validators || [];
};

Authorizer.prototype.validate = function (request, user, role) {
    for (let validator of this.validators) {
        if (validator.match(request, user, role)) {
            return validator.allowed;
        }
    }
    return false;       // default denay.
};

var allow = function (rules) {
    return new Validator(true, rules);
};

var deny = function (rules) {
    return new Validator(false, rules);
};

module.exports.Authorizer = Authorizer;
module.exports.allow = allow;
module.exports.deny = deny;
