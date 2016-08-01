var express = require('express');
var http = require('http');
var request = require('request');
var router = express.Router();

var db = require('pg');
db.defaults.ssl = true;

var APIManagementKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ3emxWQTVyTElDdlVFcnpGZXpobXhOVUROZVZPNlhiZCIsInNjb3BlcyI6eyJ1c2VycyI6eyJhY3Rpb25zIjpbInJlYWQiLCJ1cGRhdGUiXX19LCJpYXQiOjE0Njk3NDkyNDksImp0aSI6IjlhZmQ1MDk5Mzg2YjZmZjVjZjViNDMzYzA4NDJjYzJjIn0.qHDZ7bMFmbFcTNBDat8uLr2vM3kFKW66m-tDWBHVFfE';


function changeDisplayName(user_id, displayName, res){

    console.log(user_id);
    var fullPath = '/api/v2/users/' + user_id;

    var fullURL = 'https://eliharkins.auth0.com' + fullPath;

    request({
        url: fullURL, //URL to hit
        body: {
          "user_metadata": {
            "displayName": displayName
          }
        },
        json: true,
        method: 'PATCH', //Specify the method
        headers: { //We can define headers too
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + APIManagementKey
        }
    }, function(error, response, body){
        if(error) {
            console.log(error);
        } else {
            console.log(response.statusCode, body);
        }
    });

    //back to client
    //res.writeHead(200, {"Accept": "text/html"});
    res.send(displayName);

};

function getDisplayName(user_id, res){

    console.log(user_id);
    var displayName = "TEST";

    var fullURL = 'https://eliharkins.auth0.com/api/v2/users/' + user_id + '?fields=user_metadata&include_fields=true';

    request({
        url: fullURL, //URL to hit
        //body: "fields=user_metadata",
        //fields: "user_metadata",
        method: 'GET', //Specify the method
        headers: { //We can define headers too
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + APIManagementKey
        }
    }, function(error, response, body){
        if(error) {
            console.log(error);
        } else {
            console.log(response.statusCode, body);
            displayName = body;
            //res.writeHead(200, {"Accept": "text/html"});
            res.send(body);
        }
    });

    //back to client
    
};

router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});


router.get('/get', function(req, res) {
	console.log("getDisplayName");
	getDisplayName(req.user.sub, res);
});

router.post('/change', function(req, res){
    console.log("changeDisplayName: ");
    var displayName = req.body.displayName;
    console.log(displayName);
    changeDisplayName(req.user.sub, displayName, res);
});


module.exports = router;


