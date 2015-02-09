var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

var routes = require('./routes/index');
var users = require('./routes/users');

var api_users = require('./routes/api/v1/users');
var api_thisthat = require('./routes/api/v1/thisthats');
var api_auth = require('./routes/api/v1/auth');
var api_general = require('./routes/api/v1/general');

var passport = require('passport');


console.log("server is now running");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/assets/favicon.ico'));app.use(logger('dev'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

var crypto = require('crypto');

function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}

app.use(multer({
    dest:'./public/images',
    onFileUploadStart: function (file) {
        var accepted_fieldnames = ["image1", "image2", "username", "password"];
        if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg') {
            console.log("rejected file upload because of mimetype: " +file.mimetype);
            return false;
        }
        console.log("index: " + accepted_fieldnames.indexOf(file.fieldname));
        if (accepted_fieldnames.indexOf(file.fieldname)=== -1) {
            console.log("rejected because tags did not match");
            return false;
        }
    },
    rename: function (fieldname, filename) {
        return randomValueHex(8) + Date.now()
    },
    limits: {
        fieldNameSize: 100,
        files: 5
    }
}));

app.use('/', routes);
app.use('/users', users);

app.use('/api/v1/users', api_users);
app.use('/api/v1/thisthats', api_thisthat);

app.use('/api/v1/auth', api_auth);
app.use('/api/v1/general', api_general);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
