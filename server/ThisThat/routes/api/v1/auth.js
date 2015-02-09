var express = require('express');
var router = express.Router();
var db = require('../../../models');
var passwordHash = require('password-hash');
var authController = require('../../../controllers/auth');
var uuid = require('node-uuid');

function expireToken(res, req, token, callback) {
	token.is_active = false;
	var now = new Date();
	now = now.getTime();
	token.expired_at = now;
	token
		.save()
		.complete(function (err) {
			if (!!err) {
				res.status(500);
				res.json(err);
			} else {
				callback(req, res);
			}
		})
};

function createNewToken(req, res) {
	var expire_date = new Date();
	var time = expire_date.getTime();
	time += 3600 * 1000 * 24 * 365;
	expire_date.setTime(time);

	var token = db
		.Token
		.build(
		{
			userId: req.user.id,
		expires_at: expire_date,
		is_active: true,
		token: uuid.v4()
	});

	token
		.save()
		.complete(function(err, token) {
			if (!!err) {
				token.destroy();
				res.status(500);
				res.json(err);
			} else {
				res.status(201);
				res.json(token);
			}
		})
};

router.post('/login', authController.isAuthenticated, function(req, res) {

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
    			expireToken(res, req, token, createNewToken)
    		} 
    		else createNewToken(req, res);

    	})



});

router.post('/logout', function(req, res) {
	if (!req.body.token) {
		res.status(400);
		res.json("please identify yourself");

	} else {


		db
			.Token
			.find({where: {token: req.body.token}})
			.complete(function (err, token) {
				if (!!err) {
					res.status(500);
					res.json(err);
				}
				else if (token) {

					expireToken(res, req, token, function (req, res) {
						res.status(200);
						res.json("logged out");
					})

				}
				else {
					res.status(400);
					res.json("token doesn't exist");
				}

			})

	}

});
module.exports = router;