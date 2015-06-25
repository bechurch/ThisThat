var express = require('express');
var router = express.Router();
var db = require('../../../models');
var passwordHash = require('password-hash');
var validator = require('validator');
var authController = require('../../../controllers/auth');

router.post('/', function(req, res) {
    var username = req.body.username;
    var phone_number = req.body.phone_number;
    var password = passwordHash.generate(req.body.password);
    console.log(username);
    console.log(phone_number);

    if(!username || !phone_number || !password){
        res.status(400);
        res.json({
            message: "missing parameters!"
        });
    }

    else{
        var user = db.User.build({
            username: username,
            password: password,
            phone_number: phone_number
        });
        user
            .save()
            .complete(function(err) {
                if (!!err) {
                    console.log('The instance has not been saved:', err);
                    res.status(500);
                    res.json({
                        message: "an error occured while creating user: " + err.detail
                    });
                } else {
                    console.log('user created: ', user);
                    res.status(200);
                    res.json({
                        message: 'user created'
                    });
                }
            });
    }

});

router.delete('/', authController.isAuthenticated, function(req, res) {
    db
        .User
        .find({ where: { id: req.user.id}})
        .complete(function (err, user) {
            if (!!err) {
                console.log('An error occurred while searching thisthat:', err);
                res.status(500);
                res.json({
                    message: 'An error occurred while searching thisthat'
                });
            }
            else {
                user
                    .destroy()
                    .complete(function(err){
                        if(!!err) {
                            console.log(err);
                            res.status(500);
                            res.json({
                                message:'thisthat failed to delete from database'
                            });
                        }
                        else {
                            res.status(200);
                            res.json({
                                message: 'user deleted'
                            });
                        }
                    })


            }

        })


});

router.get('/:username', authController.tokenIsAuthenticated, function(req, res) {
    /*
     returns the user that matches the username provided
     */
    db
        .User
        .find({ where:
        {
            username: req.params.username
        },
            attributes: ['id', 'username']
        })
        .complete(function(err, user) {
            if(!!err){
                res.json(err)
            } else {
                var sql_query = 'select "thisthats"."id", ' +
                    '"thisthats"."expires_at", ' +
                    '"thisthats"."message", ' +
                    '"thisthats"."image_1", ' +
                    '"thisthats"."image_2", ' +
                    '"thisthats"."vote_count_1", ' +
                    '"thisthats"."vote_count_2", ' +
                    '"thisthats"."createdAt" ' +
                    'from ' +
                    '(select * from thisthat where id NOT IN ' +
                    '(select "thisthatId" from votes where "userId" = ' +
                    req.user.id +
                    ')' +
                    ' AND "is_active" = true AND "userId" = ' +
                    user.id +
                    ' AND "feed_permissions" && ARRAY[0,' +
                    req.user.id +
                    ']) AS thisthats ' +
                    'ORDER BY "thisthats"."createdAt" DESC ' +
                    'LIMIT 20';

                db
                    .sequelize
                    .query(sql_query)
                    .success(function (thisthats){
                        res.status(200);
                        res.set('Content-Type', 'application/json');
                        var returnObject = {
                            User: user,
                            ThisThats:thisthats
                        };

                        res.send(JSON.stringify(returnObject));

                    });

            }


        })

});

module.exports = router;
