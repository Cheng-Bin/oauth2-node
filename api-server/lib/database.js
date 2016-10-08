
var utils = require('./utils');



var dataAccessToken = [];


/**
 * 获取accesstoken信息
 * 
 * @param {any} token
 * @param {any} callback
 * @returns
 */
exports.getAccessTokenInfo = function(token, callback) {
    var info = dataAccessToken[token];
    if (!info) return callback(utils.invalidParameterError('token'));
    callback(null, info);
};