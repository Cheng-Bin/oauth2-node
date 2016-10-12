
var path = require('path');
var parseUrl = require('url').parse;
var js2xmlparser = require('js2xmlparser');
var database = require('./database');
var utils = require('./utils');
var connect = require('connect');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');


var postBody = connect();
postBody.use(bodyParser.json());
postBody.use(bodyParser.urlencoded({extended: true}));
postBody.use(multipart());
exports.postBody = postBody;

/**
 * 检查用户是否已经登录
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.ensureLogin = function(req, res, next) {
    // 假设chapin已经登录
    req.loginUserId = 'chapin';
    next();
};


/**
 * response扩展
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.extendApiOutput = function(req, res, next) {

    
    /**
     * 输出数据
     * 
     * @param {any} data
     * @returns
     */
    function output(data) {
        var type = path.extname(parseUrl(req.url).pathname);
        if (!type) type = '.' + req.accepts(['json', 'xml']);
        switch (type) {
            case '.xml':
                return res.xml(data);
            case '.json':
            default:
                return res.json(data);
        }
    }

    /**
     * 响应api成功结果
     * 
     * @param {any} data
     */
    res.apiSuccess = function(data) {
        output({
            status: 'OK',
            result: data
        });
    };


    /**
     * 响应api错误结果，err是一个Error对象，
     * 包含两个对象：error_code 和 error_message
     * 
     * @param {any} err
     */
    res.apiError = function(err) {
        output({
            status: 'Error',
            error_code: err.error_code || 'UNKNOWN',
            error_message: err.error_message || err.toString()
        });
    };

    
    /**
     * 输出xml格式数据
     * 
     * @param {any} data
     */
    res.xml = function(data) {
        res.setHeader('content-type', 'text/xml');
        res.end(js2xmlparser('data', data));
    };

    next();
};


/**
 * 校验token
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns
 */
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



/**
 * 统一处理api出错信息
 * 
 * @param {any} err
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns
 */
exports.apiErrorHandle = function(err, req, res, next) {
    console.log((err && err.stack) || err.toString());

    if (typeof res.apiError === 'function') {
        return res.apiError(err);
    }

    next();
};