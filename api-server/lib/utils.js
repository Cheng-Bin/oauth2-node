var clone = require('clone');
var utils = module.exports = exports = clone(require('lei-utils'));


/**
 * 创建出错对象
 * 
 * @param {any} code    出错代码(常量)
 * @param {any} msg     出错信息
 */
utils.createApiError = function(code, msg) {
    var err = new Error(msg);
    err.error_code = code;
    err.error_message = msg;
    return err;
};

/**
 * 缺少参数错误
 * 
 * @param {any} name 参数名称
 * @returns
 */
utils.missingParameterError = function(name) {
    return utils.createApiError('MISSING_PARAMETER', '缺少参数`' + name + '`');
};


/**
 * 参数错误
 * 
 * @param {any} name 参数名称
 * @returns
 */
utils.invalidParameterError = function(name) {
    return utils.createApiError('INVALID_PARAMETER', '参数`' + name + '`不正确');
};


/**
 * 回调地址不正确错误
 * 
 * @param {any} url
 * @returns
 */
utils.redirectUriNotMatchError = function(url) {
    return utils.createApiError('REDIRECT_URI_NOT_MATCH', '回调地址不正确：' + url);
};
