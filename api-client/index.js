
var express = require('express');
var client = require('./client');


var app = express();

app.get('/app/auth', client.requestAuth);
app.get('/app/auth/callback', client.authCallback);
app.get('/app', client.app);

app.listen(3001, function() {
    console.log('app listening on port: ', 3001);
});