var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('adminSignin.ejs');
});
router.get('/signin', function(req, res, next) {
    res.render('adminSignin.ejs');
});
router.get('/products', function(req, res, next) {
    res.render('products.ejs');
});
router.get('/product/update', function(req, res, next) {
    const productId = req.query.productId;
    res.render('updateProduct.ejs',{productId});
});
router.get('/product/create', function(req, res, next) {
    res.render('createProduct.ejs');
});
module.exports = router;