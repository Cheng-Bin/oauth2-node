
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
                res.redirect(utils.addQueryParamsToUrl(req.query.redirect_uri, {
                    code: ret
                }));
            });
};