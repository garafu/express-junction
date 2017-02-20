var Settings = {
    "view ext": "ejs",
    "serialize": function (data, done) {
        done(null, data);
    },
    "deserialize": function (data, done) {
        done(null, data);
    },
    "authenticate": function (request, done) {
        done(null, null);
    },
    "authorize": function (request, done) {
        done(null, request.user.name, request.user.roles);
    }
};

module.exports = Settings;