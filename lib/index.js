/**
 * 
 *   express-junction
 * 
 *   description : express-junction is a middle-ware for express.
 *   copyright   : Copyright (c) 2017 akinari tsugo
 *   license     : MIT
 */

/**
 * Entry point of this middle-ware.
 * Append returned value of this method to express.
 * @public
 * @return  {function}
 */
var junction = function () {
    var http = require("http");

    http.IncomingMessage.prototype.signin = function (identifier, remember, done) {
        junction.settings.serialize(identifier, (error, data) => {
            this.session.regenerate((error) => {
                this.session.__data = data;
                this.session.__isAuthn = true;
                if (typeof (remember) === "boolean") {
                    remember = 604800; // = 7 * 24 * 60 * 60 (=7days);
                }
                if (typeof (remember) === "number") {
                    var millisec = remember * 1000;
                    this.session.cookie.expires = new Date(Date.now() + millisec);
                    this.session.cookie.maxAge = millisec;
                }
                done(error);
            });
        });
    };

    http.IncomingMessage.prototype.signout = function (done) {
        var session = this.session;
        session.__data = undefined;
        session.__isAuthn = undefined;
        session.destroy((error) => {
            done(error);
        });
    };

    http.IncomingMessage.prototype.isAuthenticated = function () {
        return !!this.session.__isAuthn;
    };

    return function (request, response, next) {
        if (request.session.__data) {
            junction.settings.deserialize(request.session.__data, (error, data) => {
                if (!error) {
                    request.user = data;
                }
                next();
            });
        } else {
            next();
        }
    };
};

/**
 * express-junction settings.
 * @type    {object}
 */
junction.settings = require("./settings.js");

/**
 * Set specified settings.
 * @param   {string}    key     Specified setting name.
 * @param   {object}    value   Specified setting value.
 */
junction.set = function (key, value) {
    if (!value) {
        return junction.settings[key];
    }
    junction.settings[key] = value;
};

/**
 * Get specified setting value.
 * @param   {string}    key     Specified setting key.
 */
junction.get = function (key) {
    return junction.settings[key];
};

/**
 * Get default routing module.
 * @return  {Router}
 */
junction.router = function () {
    var router = require("./router.js");
    return router;
};

// exports modules.
module.exports = junction;
module.exports.Controller = require("./controller.js");
module.exports.Action = require("./action.js");
module.exports.Authenticator = require("./authenticator.js");
module.exports.Authorizer = require("./authorizer.js").Authorizer;
module.exports.allow = require("./authorizer.js").allow;
module.exports.deny = require("./authorizer.js").deny;
