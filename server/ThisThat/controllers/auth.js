// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var TokenStrategy = require('passport-token-auth').Strategy;
var db = require('../models');
var passwordHash = require('password-hash');

function userFromToken (token, callback) {
    db
        .User
        .find({ where: {id: token.userId} })
        .complete(function (err, user) {
            if (!!err) {
                return callback(err);
            } else if (!user) {
                return callback(null, false);
            }
            else {
                return callback(null, user);
            }
        })

}

passport.use(new TokenStrategy(
    function(token, done) {
        db
            .Token
            .find({ where: {token: token, is_active: true} })
            .complete(function (err, token) {
                if (!!err) {
                    return done(err);
                }
                else if (!token) {
                    return done(null, false);
                }
                else{
                    return userFromToken(token, done);

                }
        });
    }
));

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
exports.tokenIsAuthenticated = passport.authenticate('token', { session : false });