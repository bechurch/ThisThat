var express = require('express');
var router = express.Router();
var db = require('../../../models');


router.get('/get_backgrounds', function(req, res) {
    db
        .ThisThat
        .findAll({ attributes: ['image_1'],limit: 10, order: '"createdAt" DESC'})
        .complete(function(err, images) {
            if(!!err) {
                console.log("An error occurred retrieving images:", err);
                res.send("An error occurred retrieving images");
            } else if (!images) {
                console.log("no images found");
                res.json("no images found");
            } else {
                res.status(200);
                res.set('Content-Type', 'application/json');
                var returnObject = {
                    images:images
                };

                res.send(JSON.stringify(returnObject));
            }
        })
})

module.exports = router;