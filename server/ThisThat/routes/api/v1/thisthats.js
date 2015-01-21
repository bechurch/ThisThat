var express = require('express');
var router = express.Router();
var db = require('../../../models');
var fs = require('fs');
var authController = require('../../../controllers/auth');




function checkThisThatExists(res, req, callback) {
    db
        .ThisThat
        .find({ where: { id: req.params.id}})
        .complete(function (err, thisthat) {
            if (!!err) {
                console.log('An error occurred while searching experience:', err);
                res.json('An error occurred while searching experience');
            } else if (!thisthat) {
                console.log('No experience matches the id');
                res.json('No experience matches the id');
            }
            else {
                callback(res, req, thisthat)
            }

        })

};

function checkUserCanVote(res, req, thisthat) {
    if (thisthat.hasUser(req.user)) {
        res.json('user does owns this experience and cannot vote')
    }
    else {

        db
            .Vote
            .findOrCreate({userId: req.user.id, thisthatId: thisthat.id}, {vote:req.params.image_id})
            .complete(function(err, vote, created) {
                if(!!err) {
                    console.log(err);
                    res.json("error while voting");
                }
                else if (created) {
                    incrementVote(res, req, thisthat, vote);
                }
                else {
                    res.json('user has already voted');
                }

            })

    }
};

function incrementVote(res, req, thisthat, vote) {
    if (req.params.image_id === '1') {
        thisthat.vote_count_1 = thisthat.vote_count_1 + 1;
        thisthat
            .save()
            .complete(function(err) {
                if (!!err) {
                    console.log('The instance has not been saved:', err);
                    res.json(err.detail);
                    vote.destroy();
                } else {
                    res.send(200);

                }
            })

    }
    else if (req.params.image_id === '2') {
        thisthat.vote_count_2 = thisthat.vote_count_2 + 1;
        thisthat
            .save()
            .complete(function(err) {
                if (!!err) {
                    console.log('The instance has not been saved:', err);
                    res.json(err.detail);
                    vote.destroy();
                } else {
                    res.send(200);

                }
            })
    }
    else {
        //destroy vote
        res.json('need to specifiy an image_id of 1 or 2');
        vote.destroy();
    }

};

router.post('/:id/:image_id/vote', authController.tokenIsAuthenticated, function(req, res) {

 if (2 < req.params.image_id || req.params.image_id < 1) {
        res.json('Please specify an image_id of 1 or 2')
    }
    else {
        checkThisThatExists(res, req, checkUserCanVote)
    }

});


router.delete('/:id', authController.tokenIsAuthenticated, function(req, res) {
    db
        .ThisThat
        .find({ where: { id: req.params.id}})
        .complete(function (err, thisthat) {
            if (!!err) {
                console.log('An error occurred while searching thisthat:', err);
                res.json('An error occurred while searching thisthat');
            } else if (!thisthat) {
                console.log('No thisthat matches the id');
                res.json('No thisthat matches the id');
            }
            else {
                if (!thisthat.hasUser(req.user)) {
                    res.json('user does not own this thisthat')
                }
                else {
                    deleteThisThat(req, res, thisthat);

                }


            }

        })


});

function deleteThisThat (req, res, thisthat) {
    //var image1_path = 'public' + thisthat.image_1;
    //var image2_path = 'public' + thisthat.image_2;

    thisthat
        .destroy()
        .complete(function(err){
            if(!!err) {
                console.log(err);
                res.json('thisthat failed to delete from database');
            }
            else {
                //fs.unlink(image1_path);
                //fs.unlink(image2_path);

                res.send(200);
            }
        })





};

router.get('/all', function(req, res) {
    db
        .ThisThat
        .findAll()
        .complete(function(err, thisthats) {
            if(!!err) {
                console.log("An error occurred retrieving ThisThats:", err);
                res.send("An error occurred retrieving ThisThats");
            } else if (!thisthats) {
                console.log("no ThisThats found");
                res.send("no ThisThats found");
            } else {
                res.set('Content-Type', 'application/json');
                var returnObject = {
                    ThisThats:thisthats
                };

                res.send(JSON.stringify(returnObject));
            }
        })
});

router.get('/', authController.tokenIsAuthenticated, function(req, res) {
    var sql_query = 'select "thisthats"."id", ' +
        '"thisthats"."expires_at", ' +
        '"thisthats"."message", ' +
        '"thisthats"."image_1", ' +
        '"thisthats"."image_2", ' +
        '"thisthats"."vote_count_1", ' +
        '"thisthats"."vote_count_2", ' +
        '"thisthats"."createdAt", ' +
        '"thisthats"."userId", ' +
        '"users"."username" ' +
        'from ' +
            '(select * from thisthat where id NOT IN ' +
                '(select "thisthatId" from votes where "userId" = ' +
                    req.user.id +
                ')' +
            ' AND "is_active" = true AND "userId" != ' +
                req.user.id +
        ') AS thisthats ' +
        'LEFT JOIN users on "thisthats"."userId" = "users"."id" ' +
        'ORDER BY "thisthats"."createdAt" DESC';

    db
        .sequelize
        .query(sql_query)
        .success(function (thisthats){
            res.set('Content-Type', 'application/json');
            var returnObject = {
                thisthats:thisthats
            };

            res.send(JSON.stringify(returnObject));

        });

});

router.get('/my', authController.tokenIsAuthenticated, function(req, res) {
    db
        .ThisThat
        .findAll({ where:{userId: req.user.id}})
        .complete(function(err, thisthats) {
            if(!!err) {
                console.log("An error occurred retrieving ThisThats:", err);
                res.send("An error occurred retrieving ThisThats");
            } else if (!thisthats) {
                console.log("no ThisThats found");
                res.send("no ThisThats found");
            } else {
                res.set('Content-Type', 'application/json');
                var returnObject = {
                    ThisThats:thisthats
                };

                res.send(JSON.stringify(returnObject));
            }
        })
});

router.get('/my/votes', authController.tokenIsAuthenticated, function(req, res) {
    var sql_query = 'select "thisthats"."id", ' +
        '"thisthats"."expires_at", ' +
        '"thisthats"."message", ' +
        '"thisthats"."image_1", ' +
        '"thisthats"."image_2", ' +
        '"thisthats"."vote_count_1", ' +
        '"thisthats"."vote_count_2", ' +
        '"thisthats"."createdAt", ' +
        '"thisthats"."userId", ' +
        '"users"."username", ' +
        '"votes"."vote" ' +
        'from ' +
        '(select * from thisthat where id IN ' +
        '(select "thisthatId" from votes where "userId" = ' +
        req.user.id +
        ')' +
        ' AND "is_active" = true AND "userId" != ' +
        req.user.id +
        ') AS thisthats ' +
        'LEFT JOIN users ON "thisthats"."userId" = "users"."id" ' +
        'LEFT JOIN votes ON "thisthats"."id" = "votes"."thisthatId" AND "votes"."userId" = ' + req.user.id +
        ' ORDER BY "thisthats"."createdAt" DESC';

    db
        .sequelize
        .query(sql_query)
        .success(function (thisthats){
            res.set('Content-Type', 'application/json');
            var returnObject = {
                thisthats:thisthats
            };

            res.send(JSON.stringify(returnObject));

        });

});

router.post('/', authController.tokenIsAuthenticated, function(req, res) {

    if (objectLength(req.files) != 2) {
        thisThatPostFailed(res, req, "need to upload 2 images")
    }

    else {
        createThisThat(res, req, req.user);
    }

});

function createThisThat (res, req, user) {
    console.log(req.files.image1);
    var thisthat = db.ThisThat.build({
                        message: req.body.message,
                        image_1: req.files.image1.path.replace('public', ''),
                        image_2: req.files.image2.path.replace('public', '')
                    });

    thisthat
        .save()
        .complete(function(err, thisthat) {
            if (!!err) {
                console.log('The instance has not been saved:', err);
                thisThatPostFailed(res, req, 'The instance has not been saved')
            } else {
                console.log('We have a persisted instance now');
                thisthat
                    .setUser(user)
                    .complete(function(err){
                        if(!!err){
                            console.log("failed to associate thisthat with user");
                            thisThatPostFailed(res, req, "failed to associate thisthat with user")
                        } else {
                            console.log("associated successfully!");
                            res.json(thisthat);
                        }
                    });
            }
        });

};

function thisThatPostFailed (res, req, message) {

    var files = [];
    var fileKeys = Object.keys(req.files);

    fileKeys.forEach(function(key) {
        files.push(req.files[key]);
    });

    files.forEach(function(file){
        fs.unlink(file.path, function (err) {
            if (err) throw err;
            console.log('removed: ' + file.path);
        });
    });



    res.send(message);

};

function objectLength(obj) {
    return Object.keys(obj).length;
}

module.exports = router;