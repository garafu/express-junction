# express-junction

express-junction is [Express](http://expressjs.com/)-compatible middleware for [Node.js](http://nodejs.org/).

This middleware provides following features.

* URL routing like ASP.NET MVC.
* Authentication
* Authorization

"express-junction" provides defaultly `/{controller name}/{action name}` URL routing rule.
there is development restriction (controllers path, and views path) , but, this middleware enables you to above URL routing more easier.
Details of path rules are following:

* Controller scripts make under the directory of "/controllers".
* View templates make under the directory of "/views/{controller name}". 

If follow above path rules, then you can access `/{controller name}/{action name}` URL.


## Installation

```
$ npm install express-junction --save
```

## Dependencies

* [express](https://www.npmjs.com/package/express)
* [express-session](https://www.npmjs.com/package/express-session)


## Sample Code

* [/app.js](#appjs)
* [/controllers/home.js](#controllershomejs)
* [/controllers/account.js](#controllersaccountjs)
* [/views/home/index.ejs](#viewshomeindexejs)
* [/views/account/login.ejs](#viewsaccountloginejs)
* [/views/account/profile.ejs](#viewsaccountprofileejs)

### /app.js
```JavaScript
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var junction = require("express-junction");

/**
 * On save to session.
 */
junction.set("serialize", function (data, done) {
    done(null, data);
});

/**
 * On load from session.
 */
junction.set("deserialize", function (data, done) {
    // User.findById(id, function (error, user){
    //     done(error, user);
    // });
    var user = {
        name: data,
        roles: ["test"]
    };
    done(null, user);
});

/**
 * On authorize access.
 */
junction.set("authorize", function (request, done) {
    var user = request.user || {};
    var username = user.name;
    var roles = user.roles;

    done(null, username, roles);
});

// express application
var app = express();

// initial settings
app.set("views", "./views");
app.set("view engine", "ejs");
app.disable("x-powered-by");

// midle ware settings
app.use(session({
    secret: "some salt",
    resave: false,
    saveUninitialized: true,
    name: "sid"
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(junction());
app.use("/public", express.static("public"));

// set routing.
app.use("/", junction.router());

// start web applicaiton.
app.listen();
```

### /controllers/home.js
```JavaScript
var {Controller, Action, allow, deny} = require("express-junction");

// Create Home controller.
var controller = new Controller("home");

// GET:/home/index action.
controller.add(new Action(
    "GET",
    "index",
    function (request, response) {
        return this.view({ title: "/home/index" });
    }
));

module.exports = controller;
```

### /controllers/account.js
```JavaScript
var {Controller, Action, allow, deny} = require("express-junction");

// Create Account controller.
var controller = new Controller("account");

// GET: /account/login
controller.add(new Action(
    "GET",
    "login",
    function (request, response) {
        return this.view({ title: "/account/login", message: "" });
    }
));

// POST: /account/login
controller.add(new Action(
    "POST",
    "login",
    function (request, response) {
        var username = request.body.username;
        var password = request.body.password;

        if (!username || !password || username !== password) {
            return this.view({ message: "Invalid username or password." });
        }

        request.signin(username, true, (error) => {
            if (error) {
                throw error;
            }
            return this.redirect("/account/profile");
        });
    })
);

// POST: /account/logout
controller.add(new Action(
    "POST",
    "logout",
    function (request, response) {
        request.signout((error) => {
            if (error) {
                throw error;
            }
            return this.json({ status: 200, message: "OK" });
        });
    }
));

// GET: /accout/profile
controller.add(new Action(
    "GET",
    "profile",
    [allow({ users: "?" })],
    function (request, response) {
        return this.view({ title: "/account/pforile", user: (request.user || { name: "" }) });
    }
));

module.exports = controller;
```

### /views/home/index.ejs
```Html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><%= title %></title>
    <link rel="stylesheet" href="/public/third_party/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="/public/third_party/font-awesome/css/font-awesome.css" />
    <style>body {padding-top: 80px;}</style>
  </head>
  <body>

   <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="/home/index">Project name</a>
        </div>
        <div id="navbar" class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li><a href="#">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </nav>

    <div class="container">
      <div class="starter-template">
        <h1>Authenticate / Authorize Sample Project</h1>
        <p class="lead"><br>
          This sample use Node.js, Express, Passport, MongoDB.
          You can learn how to build authn/authz function.
        </p>
        <p class="lead">
          <a type="button" class="btn btn-primary btn-lg" href="/account/login">Sign-in</a>
        </p>
      </div>
    </div><!-- /.container -->
 
    <script type="text/javascript" src="/public/third_party/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="/public/third_party/bootstrap/dist/js/bootstrap.js"></script>
  </body>
</html>
```

### /views/account/login.ejs
```Html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><%= title %></title>
    <link rel="stylesheet" href="/public/third_party/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="/public/third_party/font-awesome/css/font-awesome.css" />
    <style>body {padding-top: 80px;}</style>
  </head>
  <body>

   <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="/home/index">Project name</a>
        </div>
        <div id="navbar" class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li><a href="#">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </nav>

    <div class="container">
      <div class="col-sm-offset-3 col-sm-6">
        <h1><i class="fa fa-sign-in"></i> Login</h1>
        <div class="panel panel-default">
          <div class="panel-body">
            <form class="form-horizontal" method="POST" action="/account/login">
              <div class="form-group">
                <label for="username" class="col-sm-4 control-label">User Name</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" id="username" name="username" />
                </div>
              </div>
              <div class="form-group">
                <label for="password" class="col-sm-4 control-label">Password</label>
                <div class="col-sm-8">
                  <input type="password" class="form-control" id="password" name="password" />
                </div>
              </div>
              <div class="form-group">
                <div class="col-sm-offset-4 col-sm-8">
                  <input type="submit" class="btn btn-default btn-lg" value="Sign-in" />
                </div>
              </div>
              <% if (message) {%>
              <div class="alert alert-danger" role="alert">
                <i class="fa fa-"></i>
                <span class="sr-only">ERROR: </span>
                <%= message %>
              </div>
              <%}%>
            </form>
          </div>
        </div>
      </div>
    </div><!-- /.container -->
 
    <script type="text/javascript" src="/public/third_party/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="/public/third_party/bootstrap/dist/js/bootstrap.js"></script>
  </body>
</html>
```

### /views/account/profile.ejs
```Html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><%= title %></title>
    <link rel="stylesheet" href="/public/third_party/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="/public/third_party/font-awesome/css/font-awesome.css" />
    <style>body {padding-top: 80px;}</style>
  </head>
  <body>

   <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="/home/index">Project name</a>
        </div>
        <div id="navbar" class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li><a href="#">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </nav>

    <div class="container">
      <div class="col-sm-offset-3 col-sm-6">
        <h1><i class="fa fa-user"></i> profile page</h1>
        <table class="table table-bordered">
        <% for (var key in user) { %>
          <tr>
            <th class="col-sm-3"><%= key %></th>
            <td class="col-sm-9"><%= user[key] %></td>
          </tr>
        <% }%>
        </table>
        <form class="text-right" method="POST" action="/account/logout">
          <input type="submit" class="btn btn-default btn-lg" value="sign-out" />
        </form>
      </div>
    </div><!-- /.container -->
 
    <script type="text/javascript" src="/public/third_party/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="/public/third_party/bootstrap/dist/js/bootstrap.js"></script>
  </body>
</html>
```


## Documents

* [Wiki](https://github.com/garafu/express-junction/wiki)


## License

[MIT License](https://raw.githubusercontent.com/garafu/express-junction/master/MIT-LICENSE.txt)

