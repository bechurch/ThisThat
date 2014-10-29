// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var db = require('../models');
var passwordHash = require('password-hash');


passport.use(new BasicStrategy(
  function(username, password, callback) {
    db
        .User
        .find({ where: { username: username} })
        .complete(function (err, user) {
            if (!!err) {
                return callback(err);
            } else if (!user || !passwordHash.verify(password, user.password)) {
                return callback(null, false);
            }
            else {
                return callback(null, user);
            }
        });
  }
));



exports.isAuthenticated = passport.authenticate('basic', { session : false });