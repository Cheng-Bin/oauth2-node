var express = require('express');
var middlewares = require('../lib/middlewares');
var database = require('../lib/database');
var router = express.Router();

/**
 *  获取文章列表
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
function getAricles(req, res, next) {
    database.queryArticles(req.query, function(err, ret) {
        if (err) return next(err);
        res.apiSuccess({articles: ret});
    });
}

router.get('/v1/articles.*', middlewares.verifyAccessToken, getAricles);
router.get('v1/articles', middlewares.verifyAccessToken, getAricles);


module.exports = router;