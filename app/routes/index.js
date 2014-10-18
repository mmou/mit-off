var express = require('express');
var router = express.Router();

/* GET method to render the home page. Also nullifies any errors in the session variable. */
router.get('/', function(req, res) {
	req.session.createerror = false;
	req.session.loginerror = false;
	res.render('index/index', { title: 'Welcome to Fritter' });
});

module.exports = router;
