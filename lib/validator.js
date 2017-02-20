
/**
 * Create and initialize a Vlidator class.
 * @constructor
 * @param   {boolean}   allowed     Whether this validator is "allow" or not.
 * @param   {object}    rules       Validate rules.
 */
var Validator = function (allowed, rules) {
    var {users, roles} = rules;

    this.allowed = allowed;
    this.users = (!users) ? undefined : (Array.isArray(users) ? users : [users]);
    this.roles = (!roles) ? undefined : (Array.isArray(roles) ? roles : [roles]);
};

/**
 * Get whether the request is matched rules.
 * @param   {string}    user
 * @param   {string[]}  roles
 */
Validator.prototype.match = function (request, user, roles) {
    var pattern = 0;
    this.users && (pattern |= 0x001);
    this.roles && (pattern |= 0x010);

    switch (pattern) {
        case 0x001:
            return this.matchWithUser(request, user);
        case 0x010:
            return this.matchWithRole(request, roles);
        case 0x011:
            return this.matchWithUser(request, user) &&
                this.matchWithRole(request, roles);
        default:
            throw new Error();
    }
};

Validator.prototype.matchWithUser = function (request, user) {
    if (this.users[0] === "*") {
        return true;
    } else if (this.users[0] === "?") {
        return request.isAuthenticated();
    } else {
        return this.isInclude([user], this.users);
    }
};

Validator.prototype.matchWithRole = function (request, roles) {
    if (this.roles[0] === "*") {
        return true;
    } else {
        return this.isInclude(roles, this.roles);
    }
};

/**
 * @param   {string[]}  actuals
 * @param   {string[]}  expects
 */
Validator.prototype.isInclude = function (actuals, expects) {
    for (let actual of actuals) {
        for (let expect of expects) {
            if (actual === expect) {
                return true;
            }
        }
    }

    return false;
};

// export module.
module.exports = Validator;