var express = require('express');
var router = express.Router();
var db = require('../../../models');
var passwordHash = require('password-hash');
var authController = require('../../../controllers/auth');

function createNewToken(req, res) {
	var token = db.Token.build({
		expires_at: sometimeinfuture,
		is_active: true,
		token: tokenstringunique
	})
	.complete(function(err, token) {
		if (!!err) {
    		res.json(err);
    	} else {
    		token
    		.setUser(req.user)
    		.complete(function(err, token){
    			if (!!err) {
    				token.destroy();
    				res.json(err);
    			} else {
    				res.json(token);
    			}
    		})
    	}

	})
};

router.post('/login', authController.isAuthenticated, function(req, res) {
    /*
    1. we need to verify that the user has no active sessions
    2. if they do issue a new token
    3. deactivate the old tokens
    4. activate the new token
    5. send the user the token
    */
    db
    	.Token
    	.find({ where: {userId: req.user.id, is_active: true}})
    	.complete(function (err, token) {
    		if (!!err) {
    			res.json(err);
    		}
    		else if (token) {
    			//expire all the tokens
    			//create new token
    			//make it active
    			token.is_active = false;
    			token.expired_at = Datetimenow;
    			token
    				.save()
    				.complete(function (err, token) {
    					if (!!err) {
    						res.json(err);
    					} else {
    						createNewToken(req, res);
    					}
    				})
    		} 
    		else createNewToken(req, res);

    	})



});

module.exports = router;