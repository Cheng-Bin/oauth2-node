var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var oauth2 = require('./routes/oauth2');

var middlewares = require('./lib/middlewares');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// resposne扩展
app.use(middlewares.extendApiOutput);

// routes
app.use('/api', middlewares.verifyAccessToken);
app.use('/OAuth2', oauth2);
app.use('/example', example);

// error handlers
// api出错信息
app.use(middlewares.apiErrorHandle);

module.exports = app;
