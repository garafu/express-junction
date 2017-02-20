var util = function () { };

util.normalizeMethodName = function (name) {
    var value = (name || "").toUpperCase();
    switch (value) {
        case "CHECKOUT":
        case "COPY":
        case "DELETE":
        case "GET":
        case "HEAD":
        case "LOCK":
        case "MERGE":
        case "MKACTIVITY":
        case "MKCOL":
        case "MOVE":
        case "M-SEARCH":
        case "NOTIFY":
        case "OPTIONS":
        case "PATCH":
        case "POST":
        case "PURGE":
        case "PUT":
        case "REPORT":
        case "SEARCH":
        case "SUBSCRIBE":
        case "TRACE":
        case "UNLOCK":
        case "UNSUBSCRIBE":
            break;
        case "ALL":
        case "*":
            value = "ALL";
            break;
        default:
            throw new Error;
    }

    return value;
};

module.exports = util;