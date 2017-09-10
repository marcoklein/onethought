/**
 * Created by marco on 04.05.17.
 */
var express = require('express');
var path = require("path");

var app = express();


app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    // link not found
    res.status(200).sendFile(__dirname + "/public/index.html");
});

app.listen(4033, function () {

    console.log('Listening on port 4033!');

});


