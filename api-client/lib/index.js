

var parseUrl = require('url').parse;
var formatUrl = require('url').format;
var request = require('request');

/**
 * 将url和param格式化
 * 
 * @param {any} url
 * @param {any} params
 */
function addQueryParamsToUrl(url, params) {
    var info = parseUrl(url, true);
    for (var i in params) {
        info.query[i] = params[i];
    }
    delete info.search;
    return formatUrl(info);
}




// 定义请求认证和api接口地址
const API_URL = 'http://127.0.0.1:3000';
const API_OAUTH2_AUTHORIZE = API_URL + '/OAuth2/authorize';
const API_OAUTH2_ACCESS_TOKEN = API_URL + '/OAuth2/access_token';
const API_ARTICLES = API_URL + '/api/v1/articles.json';


/**
 *  APIClient构造方法
 * 
 * @param {any} options
 */
function APIClient(options) {
    this._appKey = options.appKey;
    this._appSecret = options.appSecret;
    this._callbackUrl = options.callbackUrl;
}


/**
 * 生成获取授权的跳转地址
 * 
 * @returns
 */
APIClient.prototype.getRedirectUrl = function() {
    return addQueryParamsToUrl(API_OAUTH2_AUTHORIZE, {
        client_id: this._appKey,
        redirect_uri: this._callbackUrl
    });
};


/**
 * 发送请求
 * 
 * @param {any} method
 * @param {any} url
 * @param {any} params
 * @param {any} callback
 */
APIClient.prototype._request = function(method, url, params, callback) {
    method = method.toUpperCase();

    //  如果已经获取了access_token，则加上source和access_token两个参数
    if (this._accessToken) {
        params.source = this._appKey;
        params.access_token = this._accessToken;
    }

    var requestParams = {
        method: method,
        url: url
    };

    if (method === 'GET' || method === 'HEAD') {
        requestParams.qs = params;
    } else {
        requestParams.formData = params;
    }


    request(requestParams, function(err, res, body) {
        if (err) return callback(err);

        try {
            var data = JSON.parse(body.toString());
        } catch (err) {
            return callback(err);
        }

        if (data.status !== 'OK') {
            return callback({
                code: data.error_code,
                message: data.err_message
            });
        }

        callback(null, data.result);
    });
};



/**
 * 获取access_token
 * 
 * @param {any} code
 * @param {any} callback
 */
APIClient.prototype.requestAccessToken = function(code, callback) {
    var me = this;
    this._request('post', API_OAUTH2_ACCESS_TOKEN, {
        code: code,
        client_id: this._appKey,
        client_secret: this._appSecret,
        redirect_uri: this._callbackUrl
    }, function(err, ret) {
        if (ret) me._accessToken = ret.access_token;
        callback(err, ret);
    });
};


/**
 * 获取文章列表
 * 
 * @param {any} params
 * @param {any} callback
 */
APIClient.prototype.getArticles = function(params, callback) {
    this._request('get', API_ARTICLES, params, callback);
};

module.exports = exports = APIClient;


