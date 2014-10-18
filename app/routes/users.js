var express = require('express');
var bcrypt = require('bcrypt');
var session = require('cookie-session');

var router = express.Router();
var User = require('./../models/user-model');
/* GET method for users home page, and renders the home page view. */
router.get('/', function(req, res) {
	User.find({}).sort('name').exec(function (err, docs) {
		if(err){
			res.send("There was a problem retrieving the list of users from the database.");
		}else{
			req.session.createerror = false;
			req.session.loginerror = false;
			display_name = (req.session.user === null ? "Anonymous" : req.session.user);
			message = (req.session.user === null ? "Login to follow users" : "Follow your friends to see their posts on your News Feed! You can also click on their names to see which posts they favorited.");
			
			User.findOne({'name' : req.session.user}).exec(function(err, current_user) {
				if (err) {
					res.send("There was a problem retrieving the record from the database.");
				} else {
					res.render('users/index', { title: 'Welcome, ' + display_name, 'message' : message, 'individuals': docs, 'following' : current_user.following, 'current_user' : current_user, });

				}
			});
		}		
	});

	req.session.createerror = false;
	req.session.loginerror = false;
});

/* GET method for the page to create a new user. Renders the homepage view with an error message if 
the user tried to create a username that already exists. */
router.get('/new', function(req, res) {
	var message = ""
	if (req.session.createerror === true) {
		message = "Oops, there was an error! You may have tried to create an invalid username or password (an empty string), or your username already exists. Please try again."
	}

	res.render('users/new', { title: 'Add New User', message: message });
	req.session.createerror = false;
  	req.session.loginerror = false;
});

/* GET method for the page to login a user. Renders the login view with an error message if 
the user's username and password did not match. */
router.get('/login', function(req, res) {
	var username = "";
  	if (req.session.user) {
  		username = req.session.user;
  	}
  	var message = ""
  	if (req.session.loginerror === true) {
  		message = "Oops! Your username and password did not match. Please try again!"
  	}
  	req.session.createerror = false;
  	req.session.loginerror = false;
	res.render('users/login', { title: 'Login User', message: message });
});

/* GET method for the page to display a list of liked posts for a particular user. Sends an error 
message if there was a problem retrieving the user's liked posts. */
router.get('/likes/:id', function(req, res, next) {
	var user_id = req.params.id;

	User.findOne({_id: user_id}).populate('liked_tweets').exec(function(err, current_user) {
		if (err) {
			res.send("There was a problem retrieving this user's liked posts.");
		} else {
			res.render('users/likes', {title: current_user.name + '\'s liked tweets', individuals: current_user.liked_tweets});
		}
	});
})

/* POST method invoked when user clicks the "follow" button to follow another user. Sends error messages if there was a problem
retrieving the users from the database. */
router.post('/follow/:id', function(req, res, next) {
    var user_id = req.params.id;
    var username = "";
    if (req.session.user) {
  		username = req.session.user;
  	}

  	User.findOne({_id: user_id}, function(err1, other_user) {
  		if (err1) {
  			res.send("There was a problem retrieving this user from the database.")
  		} else {
	  		User.findOne({name: username}, function(err2, current_user) {
	  			if (err2) {
	  				res.send("There was a problem retrieving this user from the database.")
	  			}
	  			else {
	  				current_user.follow_user(other_user);
	  			}
	  		})  			
  		}

  	})

  	res.redirect("/users");
})

/* POST method to create a new user using the username and password sent from the HTML form. 
Sends error messages if there was a problem inserting or retrieving records from the database. */
router.post('/create', function(req, res, next) {
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(req.body.password, salt);
	var username = req.body.user;

	User.find({name: username}, function(err, docs) {

      if(err){
        res.send("This user does not exist.");
      }else{
		if (docs.length != 0 || req.body.user === "" || req.body.password === "") {
			req.session.createerror = true;
			res.redirect("/users/new");
		}
		else {
			var new_user = new User({ name: username, password: hash });
			new_user.follow_self();
			new_user.save(function (err) {
				if(err){
					res.send("There was a problem inserting the record into the database.");
				}else{
					req.session.user = req.body.user;
					req.session.pw = req.body.password;
					req.session.createerror = false;
					req.session.loginerror = false;
					res.redirect("/posts");
				}
			})			
		}
      }
	})
});

/* POST method to log in user. Sets the session variable if username and password match, else sets session.loginerror.
Sends error message if there was a problem retrieving a record from the database. */
router.post('/login_user', function(req, res, next) {
	var salt = bcrypt.genSaltSync(10);
	var curr_user = req.body.user;
	User.find({name: curr_user}, function(err, docs) {
      if(err || docs.length === 0 || curr_user === ""){
        res.send("This user does not exist. ");
      }else{
		var hash = docs[0]['password'];

		bcrypt.compare(req.body.password, hash, function(err, result) {
			if (result === false) {
				req.session.loginerror = true;
				res.redirect("/users/login");
			}
			else {
				req.session.user = req.body.user;
				req.session.pw = req.body.password;
				req.session.loginerror = false;
				req.session.createerror = false;
				res.redirect("/posts");
			}
		});
      }

	});
});

/* POST method to log out user. Resets the session variable. */
router.post('/logout', function(req, res, next) {
	req.session.user = null;
	req.session.pw = null;
	req.session.createerror = false;
	req.session.loginerror = false;
	res.redirect("/posts");
});

module.exports = router;
