
var APIClient = require('./lib');

var client = new APIClient({
    appKey: 'a10086',
    appSecret: '1qaz2wsx',
    callbackUrl: 'http://127.0.0.1:3001/app/auth/callback'
});


/**
 * 认证页面
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.requestAuth = function(req, res, next) {
    res.redirect(client.getRedirectUrl());  
};


/**
 * 认证回调
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.authCallback = function(req, res, next) {
    client.requestAccessToken(req.query.code, function(err, ret) {
        if (err) return res.send(err.toString());
        res.redirect('/app');
    });
};


/**
 *  获取文章列表
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.app = function(req, res, next) {
    if (!client._accessToken) return res.redirect('/app/auth');

    client.getArticles(req.query, function(err, ret) {
        if (err) return res.send(err.toString());
        console.log(ret);
        res.send({
            accessToken: client._accessToken,
            result: ret
        });
    });
}