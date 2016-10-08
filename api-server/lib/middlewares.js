
var database = require('./database');
var utils = require('./utils');

exports.verifyAccessToken = function(req, res, next) {
    var accessToken = (req.body && req.body.access_token) || req.query.access_token;
    var source = (req.body && req.body.source) || req.query.source;

    if (!accessToken) return next(utils.missingParameterError('access_token')); 
    if (!source) return next(utils.missingParameterError('source'));
    
    database.getAccessTokenInfo(accessToken, function(err, tokenInfo) {
        if (err) return next(err);

        if (source !== tokenInfo.clientId) {
            return next(utils.invalidParameterError('source'));
        }

        req.accessTokenInfo = tokenInfo;

        next();
    });

};