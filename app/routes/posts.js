var express = require('express');
var router = express.Router();
var Post = require('./../models/post-model');
var User = require('./../models/user-model');

/* GET method for the posts homepage. 
Sends a request to render the posts homepage, which displays the news feed of all the posts. 
Sets the status, route, and method variables to appropriately toggle the login/logout button displayed on the News Feed.
Sends an error message if there was an issue retrieving database records. */
router.get('/', function(req, res) {
    var username = "Anonymous";
    req.session.createerror = false;
    req.session.loginerror = false;

    /* The status, route, and method local variables are passed to the view to toggle the login button to logout if there's
    a user already logged in, and to toggle the logout button to say login if there is no user logged in.*/ 
    var status = "Login";
    var route = "/users/login";
    var method = "get";
    if (req.session.user) {
      username = req.session.user;
      status = "Logout";
      route = "/users/logout";
      method = "post";
    }

    User.findOne({name: username}).sort('_id').exec(function(err, current_user) {
      if (current_user !== null) {
        Post.display_feed(current_user, function(err, docs){
            if(err){
              res.send("There was a problem retrieving records from the database.");
            }else{
              res.render('posts', { title: "Welcome, " + username, 'individuals': docs, user_id: current_user._id, loginstatus: status, route: route, method: method });
            }
        });
      }
      else {
        res.render('posts', { title: "Welcome, " + username, 'individuals': [], user_id: "", loginstatus: status, route: route, method: method });
      }

    })


});

/* 
GET request for the user's dashboard to create, edit, or delete messages.
Sends an error message if there was an issue retrieving database records.
*/
router.get('/new', function(req, res) {

    var username = ""
    req.session.createerror = false;
    req.session.loginerror = false;

    if (req.session.user) {
      username = req.session.user;
    }

    Post.find({"name" : username}, function(err, docs){
      if(err){
        res.send("There was a problem retrieving a record from the database.");
      }else{
        res.render('posts/new', { title: 'Create, Edit, or Delete Freets', 'individuals': docs });
      }
    });
});

/* POST request to delete message. Sends an error message if there was a problem removing the record from the database. */
router.post('/delete/:id', function(req, res, next) {

    var post_id = req.params.id;    
    Post.remove({_id: post_id.toString()}, function(err, docs){
      if(err){
        res.send("There was a problem removing a record from the database.");
      }else{
        res.redirect("/posts");
      }
    })
});

/* POST request to edit message. Sends an error message if there was a problem updating the record from the database.*/
router.post('/edit/:id', function(req, res) {

    var post_id = req.params.id;
    var username = ""
    if (req.session.user) {
  		username = req.session.user;
  	}

    Post.update({_id: post_id.toString()}, {"post": req.body.freet}, function(err, docs){
      if(err){
        res.send("There was a problem updating a record from the database.");
      }else{
        res.redirect("/posts");
      }
    })
});

/* POST request to create a new message. Sends an error message if there was a problem adding a record to the database. */
router.post('/create', function(req, res, next) {

    var username = ""
    if (req.session.user) {
    	username = req.session.user;
    }

    User.findOne({name : username}, function(err, docs) {
      var new_post = new Post({ _creator: docs._id, name: docs.name, post: req.body.freet });
      new_post.save(function (err) {
        if(err){
          res.send("There was a problem adding a record to the database.");
        }else{
          res.redirect("/posts");
        }      
      });

    })

});

/* POST request to like a tweet. Sends an error message if there was a problem retrieving a particular tweet or user from the database. */
router.post('/like/:id', function(req, res, next) {
    var post_id = req.params.id;
    var username = "";
    if (req.session.user) {
      username = req.session.user;
    }

    User.findOne({name: username}, function(err1, user) {
      if (err1) {
        res.send("There was a problem retrieving this user from the database.");
      }
      else {
        Post.findOne({_id: post_id}, function(err2, post) {
          if (err2) {
            res.send("There was a problem retrieving this post from the database.");
          }
          else {
            post.like_post(user);
          }
        })        
      }

    })

    res.redirect("/posts");
})

module.exports = router;