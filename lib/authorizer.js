var Validator = require("./validator.js");

/**
 * Authorizer class.
 * @constructor
 * @param   {Validator[]}   validators
 */
var Authorizer = function (validators) {
    this.validators = validators || [];
};

/**
 * Get whether specified condition is authorized or not.
 * @param   {Request}       request         Request object of express.
 * @param   {string}        user            User name.
 * @param   {string}        role            Role nema.
 */
Authorizer.prototype.validate = function (request, user, role) {
    for (let validator of this.validators) {
        if (validator.match(request, user, role)) {
            return validator.allowed;
        }
    }
    return false;       // default denay.
};

/**
 * Allow specified user or role.
 * @param   {Validator[]}       rules       Allow users or roles.
 * @return  {Validator}
 */
var allow = function (rules) {
    return new Validator(true, rules);
};

/**
 * Deny specified user or role.
 * @param   {Validator[]}       rules       Deny users or roles.
 * @return  {Validator}
 */
var deny = function (rules) {
    return new Validator(false, rules);
};

// export module.
module.exports.Authorizer = Authorizer;
module.exports.allow = allow;
module.exports.deny = deny;
