
var utils = require('../lib/utils');
var database = require('../lib/database');



/**
 * 检查参数
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.checkAuthorizeParams = function(req, res, next) {
    if (!req.query.client_id) {
        return next(utils.missingParameterError('client_id'));
    }
    if (!req.query.redirect_uri) {
        return next(utils.missingParameterError('redirect_uri'));
    }

    database.getAppInfo(req.query.client_id, function(err, ret) {
        if (err) return next(err);

        req.appInfo = ret;
        database.verifyAppRedirectUri(
            req.query.client_id, 
            req.query.redirect_uri, 
            function(err, ok) {
            if (err) {
                return next(err);
            }
            if (!ok) {
                return next(utils.redirectUriNotMatchError(req.query.redirect_uri));
            }

            next();
        });

    });

};

/**
 * 显示确认页面
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.showAppInfo = function(req, res, next) {
    res.locals.loginUserId = req.loginUserId;
    res.locals.appInfo = req.appInfo;
    res.render('index');
};


/**
 * 确认授权
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.confirmApp = function(req, res, next) {
    database.generateAuthorizationCode(
            req.loginUserId, 
            req.query.client_id, 
            req.query.redirect_uri,
            function(err, ret) {
                if (err) return next(err);
                console.log(ret);
                res.redirect(utils.addQueryParamsToUrl(req.query.redirect_uri, {
                    code: ret
                }));
            });
};


/**
 * 获取access_token
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.getAccessToken = function(req, res, next) {

    var client_id = req.body.client_id || req.query.client_id;
    var client_secret = req.body.client_secret || req.query.client_secret;
    var redirect_uri = req.body.redirect_uri || req.query.redirect_uri;
    var code = req.body.code || req.query.code;

    if (!client_id) return next(utils.missingParameterError('client_id'));
    if (!client_secret) return next(utils.missingParameterError('client_secret'));
    if (!redirect_uri) return next(utils.missingParameterError('redirect_uri'));
    if (!code) return next(utils.missingParameterError('code'));

    database.verifyAuthorizationCode(code, client_id, client_secret, redirect_uri, function(err, userId) {
        if (err) return next(err);

        database.generateAccessToken(userId, client_id, function(err, accessToken) {
            if (err) return next(err);
            database.deleteAuthorizationCode(code, function(err) {
                if (err) console.error(err);
            });

            res.apiSuccess({
                access_token: accessToken,
                expires_in: 3600 * 24
            });
        });
    });

};