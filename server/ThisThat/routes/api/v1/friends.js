var express = require('express');
var router = express.Router();
var db = require('../../../models');

var authController = require('../../../controllers/auth');

router.get('/', authController.tokenIsAuthenticated, function(req, res) {
    /*
    returns all mutual friendships for user
     */
    var mutual_friends_query = '(SELECT "f1"."friendId" ' +
        'FROM (select * from friends where "userId" = ' +
        req.user.id +
        ') as f1 INNER JOIN friends AS f2 ON "f1"."userId" = "f2"."friendId" AND "f2"."userId" = "f1"."friendId")';

    var sql_query = 'SELECT id, username from users where id in ' + mutual_friends_query;

    db
        .sequelize
        .query(sql_query)
        .success(function (friends){
            res.status(200);
            res.set('Content-Type', 'application/json');
            var returnObject = {
                Friends:friends
            };

            res.send(JSON.stringify(returnObject));

        });
});

function friendExists(friendId, callback) {
    db
        .User
        .find({ where:{id: friendId}})
        .complete(function(err, friend) {
            if(friend) {
                callback(friend);
            }
            else callback();
        })

}

router.post('/add/:id', authController.tokenIsAuthenticated, function(req, res) {
    console.log(req.params.id);
    console.log(req.user.id);

    friendExists(req.params.id, function (canFriend) {
        if (canFriend && req.user.id != req.params.id) {
            db
                .Friend
                .find({ where: {friendId: req.params.id, userId: req.user.id}})
                .complete(function(err, friend){
                    if (!!err) {
                        res.send(err);
                    }
                    else if (friend) {
                        res.status(401);
                        res.json('They are already a friend');
                    }
                    else {
                        var newFriend = db.Friend.build({
                            userId: req.user.id,
                            friendId: req.params.id
                        });

                        newFriend
                            .save()
                            .complete(function(err, new_friend) {
                                if (!!err) {
                                    console.log('The instance has not been saved:', err);
                                } else {
                                    console.log('We have a persisted instance now');
                                    res.send(new_friend);
                                }
                            });
                    }

            })

        }
        else {
            res.status(401);
            res.json("unable to friend yourself or a non existant user");
        }
        })



});

router.get('/search', authController.tokenIsAuthenticated, function(req, res) {
    /*
     returns users that match the phone numbers provided and the user hasn't friended
     */
    db
        .User
        .findAll({ where:
            {
                phone_number: {
                    in: req.param('phone_number')
                }
            },
            attributes: ['id', 'username']
        })
        .complete(function(err, users) {
            if(!!err) {
                res.json(err);
            } else {
                 db
                     .Friend
                     .findAll({ where:
                     {
                         userId: req.user.id
                     },
                         attributes: ['friendId']
                     })
                     .complete(function(err, friends) {
                         if(!!err){
                             res.json(err)
                         } else {
                             friends = friends.map(function(friend){
                                 return friend.friendId;
                             });
                             res.json({
                                 Friends: users.filter(function (user){
                                     return friends.indexOf(user['id']) < 0;
                                 })
                             })
                         }

                     })
            }
        })

});


function deleteFriend (req, res, friend) {

    friend
        .destroy()
        .complete(function(err){
            if(!!err) {
                console.log(err);
                res.status(500);
                res.json({
                    message: 'friend failed to delete from database'
                });
            }
            else {
                res.status(200);
                res.json({
                    message: 'friend successfully removed'
                });
            }
        })





};

router.delete('/remove/:id', authController.tokenIsAuthenticated, function(req, res) {
    db
        .Friend
        .find({ where: { friendId: req.params.id, userId: req.user.id}})
        .complete(function (err, friend) {
            if (!!err) {
                console.log('An error occurred while searching friend:', err);
                res.status(500);
                res.json({
                    message: 'An error occurred while searching friend'
                });
            } else if (!friend) {
                console.log('No friend matches the id');
                res.status(400);
                res.json({
                    message: 'No friend matches the id'
                });
            }
            else {
                deleteFriend(req, res, friend);
            }

        })
});

router.get('/requests', authController.tokenIsAuthenticated, function(req, res) {
    /*
     returns all friendships for user that the user hasnt reciprocated
     */
    var friend_requests_query = '(SELECT "userId" ' +
        'FROM friends WHERE "friendId" = ' +
        req.user.id +
        ' AND "userId" NOT IN (SELECT "friendId" FROM friends where "userId" = ' +
        req.user.id +
        '))';

    var sql_query = 'SELECT id, username from users where id in ' + friend_requests_query;

    db
        .sequelize
        .query(sql_query)
        .success(function (friends){
            res.status(200);
            res.set('Content-Type', 'application/json');
            var returnObject = {
                requests:friends
            };

            res.send(JSON.stringify(returnObject));

        });

});

router.get('/pending', authController.tokenIsAuthenticated, function(req, res) {
    /*
     returns all friendships that the user has sent but haven't been reciprocated
     */
    var pending_request_query = '(SELECT "friendId" ' +
        'FROM friends WHERE "userId" = ' +
        req.user.id +
        ' AND "friendId" NOT IN (SELECT "userId" FROM friends where "friendId" = ' +
        req.user.id +
        '))';

    var sql_query = 'SELECT id, username from users where id in ' + pending_request_query;

    db
        .sequelize
        .query(sql_query)
        .success(function (friends){
            res.status(200);
            res.set('Content-Type', 'application/json');
            var returnObject = {
                pending:friends
            };

            res.send(JSON.stringify(returnObject));

        });

});

module.exports = router;
