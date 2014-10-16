var express = require('express');
var router = express.Router();
var db = require('../../../models');
var fs = require('fs');
var passwordHash = require('password-hash');


function checkUserExists(res, req, callback) {
    db
        .User
        .find({ where: { username: req.body.username} })
        .complete(function (err, user) {
            if (!!err) {
                console.log('An error occurred while searching user:', err);
                res.json('An error occurred while searching user');
            } else if (!user || !passwordHash.verify(req.body.password, user.password)) {
                console.log('No user with those credentials exist', err);
                res.json('No user with those credentials exist');
            }
            else {
                callback(res, req, user)
            }
        })
};

function checkThisThatExists(res, req, user) {
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
                checkUserCanVote(res, req, user, thisthat)
            }

        })

};

function checkUserCanVote(res, req, user, thisthat) {


    if (thisthat.hasUser(user)) {
        res.json('user does owns this experience and cannot vote')
    }
    else {
        /*
        1. check vote doesnot exist
        2. create vote
        3. save vote
        4. increase count
        5. save thisthat
        6. delete vote if it doesn't save properly
         */
        db
            .Vote
            .findOrCreate({userId: user.id}, {thisthatId: thisthat.id}, {vote:req.params.image_name})
            .success(function(vote, created) {
                if (created) {
                    //increment vote
                    incrementVote(res, req, thisthat, vote);
                }
                else {
                    res.json('user has already voted');
                }

            })

    }
};

function incrementVote(res, req, thisthat, vote) {
    if (req.params.image_name === 'image1') {
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
    else if (req.params.image_name === 'image2') {
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
        res.json('need to specifiy image1 or image2');
        vote.destroy();
    }

};

router.post('/:id/:image_name/vote', function(req, res) {
    console.log(req.params.image_name);

    if(!req.body.username || !req.body.password) {
        res.json('Please provide Login Credentials')
    }
    else if (req.params.image_name != 'image1' && req.params.image_name != 'image2') {
        res.json('Please specify image1 or image2')
    }
    else {
        checkUserExists(res, req, checkThisThatExists)
    }

});


router.delete('/:id', function(req, res) {
    var username = req.body.username;
    var thisthat_id = req.params.id;
    db
        .User
        .find({ where: { username: username} })
        .complete(function (err, user) {
            if (!!err) {
                console.log('An error occurred while searching user:', err);
                res.json('An error occurred while searching user');
            } else if (!user|| !passwordHash.verify(req.body.password, user.password)) {
                console.log('No user with those credentials exist', err);
                res.json('No user with those credentials exist');
            }
            else {
                db
                    .ThisThat
                    .find({ where: { id: thisthat_id}})
                    .complete(function (err, thisthat) {
                        if (!!err) {
                            console.log('An error occurred while searching thisthat:', err);
                            res.json('An error occurred while searching thisthat');
                        } else if (!thisthat) {
                            console.log('No thisthat matches the id');
                            res.json('No thisthat matches the id');
                        }
                        else {
                            if (!thisthat.hasUser(user)) {
                                res.json('user does not own this thisthat')
                            }
                            else {
                                thisthat
                                    .destroy()
                                    .complete(function(err){
                                        if(!!err) {
                                            console.log(err);
                                            res.json('thisthat failed to delete from database');
                                        }
                                        else {
                                            res.send(200);
                                        }
                                    })
                            }


                        }

                    })
            }
        })

});

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

router.post('/', function(req, res) {
    var username = req.body.username;

    if (objectLength(req.files) != 2) {
        thisThatPostFailed(res, req, "need to upload 2 images")
    }

    else if (!username || !req.body.password) {
        thisThatPostFailed(res, req, "missing credentials")

    }
    else {
        db
            .User
            .find({ where: { username: username} })
            .complete(function (err, user) {
                if (!!err) {
                    thisThatPostFailed(res, req, 'An error occurred while searching user:');
                } else if (!user || !passwordHash.verify(req.body.password, user.password)) {
                    thisThatPostFailed(res, req, 'No user with those credentials exist');
                }
                else {
                    createThisThat(res, req, user);
                }
            })
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