var express = require('express');
var router = express.Router();
var db = require('../../../models');
var passwordHash = require('password-hash');
var validator = require('validator');

router.post('/', function(req, res) {
    var username = req.body.username;
    var phone_number = req.body.phone_number;
    var password = passwordHash.generate(req.body.password);
    console.log(username);
    console.log(phone_number);

    if(!username || !phone_number || !password){
        res.send("missing parameters!\n");
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
                    res.json("an error occured while creating user: " + err.detail);
                } else {
                    console.log('We have a persisted instance now');
                    res.json(200)
                }
            });
    }

});

module.exports = router;
