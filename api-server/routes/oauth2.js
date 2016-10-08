var express = require('express');
var middlewares = require('../lib/middlewares');
var authorize = require('./authorize');
var router = express.Router();

router.get('/authorize', middlewares.ensureLogin, authorize.checkAuthorizeParams, authorize.showAppInfo);
router.post('/authorize', middlewares.ensureLogin, middlewares.checkAuthorizeParams, authorize.confirmApp);

// router.post('/access_token', );


module.exports = router;