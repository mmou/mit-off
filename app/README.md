proj2
=====

Directions: To view the app, go to http://fritter-hkannan.rhcloud.com/.

Citation: I got the starting code for my app from sample-express-app.

1 Grading Directions

1.1 Highlights

1.1.1. Password hashing

I hashed all of my passwords so I wouldn’t store them in plaintext, and I used the bcrypt hashing library to do this. In the case that my database was compromised, my user’s passwords would still be safe.

https://github.com/6170-fa14/hkannan_proj2/blob/master/routes/users.js#L49
https://github.com/6170-fa14/hkannan_proj2/blob/master/routes/users.js#L92

1.1.2 I decided that anonymous users should be able to create tweets but not edit or delete them, so anonymous users don’t see the option to edit or delete tweets. Users who were logged in can still edit or delete tweets as usual. 

https://github.com/6170-fa14/hkannan_proj2/blob/master/routes/posts.js#L84-L89
https://github.com/6170-fa14/hkannan_proj2/blob/master/views/posts/new.ejs#L15

1.1.3. Descriptive error messages

I threw descriptive error messages at any possible junction that could cause an error - for example, if a database record could not be retrieved, updated, or deleted, or if someone tried to login with an invalid username. 
https://github.com/6170-fa14/hkannan_proj2/blob/master/routes/users.js#L87-L88

In order to throw these error messages, I stored the state of the error in the session variable:

https://github.com/6170-fa14/hkannan_proj2/blob/master/routes/users.js#L35-L37
 
2 Design Challenges

2.1 Problems encountered and options available

One problem I had was what to do with the question of anonymous users. There were multiple design decisions here - for example, how would I represent an anonymous user in my database? I chose to represent an anonymous user as an empty string in the database, and then did not allow users to create accounts with a username that was an empty string. Additionally, in the view, I did not allow tweets to be editable or deletable if the user was not logged in. I chose to represent anonymous users this way, instead of setting a cookie session variable to be of an anonymous user, because I thought that setting cookies for anonymous users would store unnecessary information about the user. This could cause privacy concerns for the user if he or she realized that cookies were being stored even without logging in.

Another major problem I encountered was how to display errors if the user submitted an incorrect username and password, or if the user tried to create an account with an existing username. It was simply to determine whether there was an error - it was just a find operation on the database. However, because this find operation was performed during a POST request when the user submitted the form, I wasn’t sure how to render a new view while in the POST request. For example, in the router.post(‘/login_user’) call in users.js, the backend used bcrypt.compare to check if the username and password matched, but the result of this comparison was not available to the front end. I saw two options here: I thought that I could create a global variable that logged errors, and the state of this global variable would store the state across POST and GET requests. My second option was similar to my first option - instead of a global variable, I could store the errors in the session variable (from the node module cookie-session) that also stored the current logged in user (or anonymous user). I decided to go with the second option because I thought it was cleaner, and the session variable represented the current state of the user session, including username, password, and now any session-related errors (such errors related to logging in or creating an account). This way, the POST method could change req.session.loginerror for example, and the GET method could simply check for the error and render a different view accordingly. This also helped me avoid the bad practice of global variables.

2.2 Chosen schema

I had two separate tables: a table for users, and a table for tweets. The table for users had the following schema:

{_id: int, 
username: string,
password: string}

The table for tweets had the following schema:

{_id: int, 
tweet: string,
username: string}

I went with this schema instead of the following:

{_id: int, 
username: string,
password: string,
tweets: list of strings}

I wanted to have two separate tables to make the data model more flexible -- for example, with two separate tables, it will be easier to add in tweet-centered features such as retweeting. Adding in a feature like retweeting could result in multiple nested JSON objects with the second schema I was considering (with only one table), so I thought that having two separate tables would be cleaner and would make my code more extensible. 

