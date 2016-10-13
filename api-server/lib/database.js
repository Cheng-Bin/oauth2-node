
var utils = require('./utils');
var database = module.exports;

/**
 *  获取应用信息
 * 
 * @param {any} id
 * @param {any} callback
 */
exports.getAppInfo = function(id, callback) {
    callback(null, {
        id: id,
        name: 'chapin',
        description: ' 专注前端20年',
        secret: '1qaz2wsx',
        redirectUri: 'http://127.0.0.1:3001/app/auth/callback'
    });
};


/**
 *  验证应用的回调URL是否合法
 * 
 * @param {any} clientId
 * @param {any} url
 * @param {any} callback
 */
exports.verifyAppRedirectUri = function(clientId, url, callback) {
    database.getAppInfo(clientId, function(err, info) {
        if (err) return callback(err);
        if (!info) return callback(utils.invalidParameterError('client_id'));
        callback(null, info.redirectUri === url);
    });
};



//----------------------- authorizationCode --------------------------
var dataAuthorizationCode = {};

/**
 * 生成授权token
 * 
 * @param {any} userId
 * @param {any} clientId
 * @param {any} redirectUri
 * @param {any} callback
 */
exports.generateAuthorizationCode = function(userId, clientId, redirectUri, callback) {
    var code = utils.randomString(20);
    dataAuthorizationCode[code] = {
        clientId: clientId,
        userId: userId
    };
    callback(null, code);
};


/**
 * 验证授权码是否正确
 * 
 * @param {any} code
 * @param {any} clientId
 * @param {any} clientSecret
 * @param {any} redirectUri
 * @param {any} callback
 */
exports.verifyAuthorizationCode = function(code, clientId, clientSecret, redirectUri, callback) {
    var info = dataAuthorizationCode[code];
    if (!info) return callback(utils.invalidParameterError('code'));
    if (info.clientId !== clientId) return callback(utils.invalidParameterError('code'));

    database.getAppInfo(clientId, function(err, appInfo) {
        if (err) return callback(err);
        if (appInfo.secret != clientSecret) return callback(utils.invalidParameterError('client_secret'));
        if (appInfo.redirectUri != redirectUri) return callback(utils.invalidParameterError('redirect_uri'));

        callback(null, info.userId);
    });
};


/**
 * 删除授权code
 * 
 * @param {any} code
 * @param {any} callback
 */
exports.deleteAuthorizationCode = function(code, callback) {
    delete dataAuthorizationCode[code];
    callback(null, code);
};




//------------------------ accesstoken --------------------------------

var dataAccessToken = [];



/**
 * 生成access_token
 * 
 * @param {any} userId
 * @param {any} clientId
 * @param {any} callback
 */
exports.generateAccessToken = function(userId, clientId, callback) {
    var code = utils.randomString(20);
    dataAccessToken[code] = {
        clientId: clientId,
        userId: userId
    };
    callback(null, code);
};


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


//--------------------------articles-----------------------------------
var faker = require('faker');
faker.local = 'zh-CN';

var dataArticles = [];
var ARTICLES_NUM = 100;

for (var i = 0; i< ARTICLES_NUM; i++) {
    dataArticles.push({
        id:faker.random.uuid(),
        author: faker.name.findName(),
        title: faker.lorem.sentence(),
        createAt: faker.date.past(),
        content: faker.lorem.paragraphs(10)
    });
}

/**
 * 生成文章列表
 * 
 * @param {any} query
 * @param {any} callback
 */
exports.queryArticles = function(query, callback) {
    query.$skip = utils.defaultNumber(query.$skip, 0);
    query.$limit = utils.defaultNumber($query.limit, 10);
    callback(null, dataArticles.slice(query.$skip, query.$skip + query.$limit));
};