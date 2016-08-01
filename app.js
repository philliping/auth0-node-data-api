var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var jwt = require('express-jwt');
var cors = require('cors');
var http = require('http');
var request = require('request');

var db = require('pg');
db.defaults.ssl = true;

var APIManagementKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ3emxWQTVyTElDdlVFcnpGZXpobXhOVUROZVZPNlhiZCIsInNjb3BlcyI6eyJ1c2VycyI6eyJhY3Rpb25zIjpbInJlYWQiLCJ1cGRhdGUiXX19LCJpYXQiOjE0Njk3NDkyNDksImp0aSI6IjlhZmQ1MDk5Mzg2YjZmZjVjZjViNDMzYzA4NDJjYzJjIn0.qHDZ7bMFmbFcTNBDat8uLr2vM3kFKW66m-tDWBHVFfE';

// var options = {
//     // global event notification;
//     error: function (error, e) {
//         if (e.cn) {
//             // A connection-related error;
//             //
//             // Connections are reported back with the password hashed,
//             // for safe errors logging, without exposing passwords.
//             console.log("CN:", e.cn);
//             console.log("EVENT:", error.message || error);
//         }
//     }
// };

// var pgp = require("pg-promise")(options);
// var db = pgp("postgresql://eli:purpleZebra@localhost:5432/mydb");





/// THIS BREAKS ON finally function:
// var sco; // shared connection object;

// db.connect()
//     .then(function (obj) {
//         // obj.client = new connected Client object;

//         sco = obj; // save the connection object;

//         // execute all the queries you need:
//         return sco.any('SELECT * FROM Users');
//     })
//     .then(function (data) {
//         // success
//     })
//     .catch(function (error) {
//         // error
//     })
//     .finally(function () {
//         // release the connection, if it was successful:
//         if (sco) {
//             sco.done();
//         }
//     });

// db.connect()
//     .then(function (obj) {
//         // obj.client = new connected Client object;
//         obj.done();
//         //console.log("SUCCESS");
//         //sco = obj; // save the connection object;

//         // // execute all the queries you need:
//         //return sco.any('SELECT * FROM user_genres');
//     })
//     .catch(function (error) {
//     	console.log("in the catch section")
//         // error
//     })
//     // .finally(function () {
//     //     // release the connection, if it was successful:
//     //     if (sco) {
//     //         sco.done();
//     //     }
//     // });

// db.connect()
//     .then(function (obj) {
//         // obj.client = new connected Client object;
//         obj.done();
//         //console.log("SUCCESS");
//         //sco = obj; // save the connection object;

//         // // execute all the queries you need:
//         //return sco.any('SELECT * FROM user_genres');
//     })
//     .catch(function (error) {
//     	console.log("in the catch section")
//         // error
//     })
//     // .finally(function () {
//     //     // release the connection, if it was successful:
//     //     if (sco) {
//     //         sco.done();
//     //     }
//     // });



var app = express();
var router = express.Router();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));


var routes = require('./routes/index');
var users = require('./routes/users');
var genres = require('./routes/genres');
var songs = require('./routes/songs');



dotenv.load();

var authenticate = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});



app.use('/', routes);
app.use('/users', users);
app.use('/secured', authenticate);
app.use('/genres', authenticate, genres);
app.use('/songs', authenticate, songs);




function getSongs(user_id, res){
 
 console.log("getSong method executing");
  db.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting data...');

  client
    .query('SELECT songname as value FROM songs WHERE user_id = $1', [user_id], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }

      console.log(result.rows);
      var i = 0;
      var songs = [];
      while (result.rows[i] )
      {
        songs[i] = result.rows[i].value;
        console.log(result.rows[i].value);
        i++;
      }
      var song_json = JSON.stringify({Songs:songs});
      console.log(song_json);

      
      res.writeHead(200, {"Accept": "application/json"});
      res.end(song_json);
      //console.log(result);
    });
  });


};

function queryGenre(user_id, res){
	
 console.log("logging works");
  db.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting data...');

  client
    .query('SELECT fav_genre as value FROM user_data WHERE user_id = $1', [user_id], function(err, result) {
      console.log(result.rows[0].value);

      if(err) {
        return console.error('error running query', err);
      }
      res.writeHead(200, {"Accept": "text/html"});
      res.end(result.rows[0].value);
    });
  });

};

function addSong(user_id, song, res){

 console.log("addSong method executing");
  db.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Writing data...');

  client
    .query('INSERT INTO songs VALUES (100, $1, $2)', [song, user_id], function(err, result) {
      console.log(JSON.stringify(result));
      //done();

      if(err) {
        return console.error('error running query', err);
      }
      res.writeHead(200, {"Accept": "text/html"});
      res.end(song);
      //console.log(result);
    });
  });

  };

function getPlays(user_id, res){
 
 console.log("getPlays method executing");
  db.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting data...');

  client
    .query('SELECT total_plays as value FROM playlists WHERE user_id = $1', [user_id], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      var plays = result.rows[0].value;

      console.log(plays);
      

      
      res.writeHead(200, {"Accept": "text/html"});
      res.end(plays);
      //console.log(result);
    });
  });


};

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
    res.writeHead(200, {"Accept": "text/html"});
    res.end(displayName);

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
            res.writeHead(200, {"Accept": "text/html"});
            res.end(body);
        }
    });

    //back to client
    
    
};

app.post('/secured/getDisplayName', function(req, res){
  console.log("getDisplayName");
  getDisplayName(req.user.sub, res);
});

app.post('/secured/changeDisplayName', function(req, res){
    console.log("changeDisplayName: ");
    var displayName = req.body.displayName;
    console.log(displayName);
    changeDisplayName(req.user.sub, displayName, res);
});


app.get('/secured/getPlays', function(req, res){
  console.log("getPlays");
  getPlays(req.user.sub, res);
});

// app.get('/secured/getSongs', function(req, res){
//   console.log("getSongs");
//   getSongs(req.user.sub, res);
// });

// genres.get('/secured/getFavGenre', function(req, res) {
//    queryGenre(req.user.sub, res);
// });

// app.post('/secured/addSong', function(req, res) {
//   var song = req.body.song;
//   //console.log(req);
//   console.log("REQUEST.BODY.song: " + song);
//   // res.writeHead(200);
//   addSong(req.user.sub, song, res);
// });

//var port = process.env.PORT || 3001;

// http.createServer(app).listen(port, function (err) {
//   console.log('listening in http://localhost:' + port);
// });

module.exports = app;

