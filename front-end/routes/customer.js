var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/signin', function(req, res, next) {
    res.render('customerSignin.ejs');
});
router.get('/signup', function(req, res, next) {
    res.render('customerSignup.ejs');
});
module.exports = router;