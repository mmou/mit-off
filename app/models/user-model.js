var mongoose = require('./mongoose');

var Schema = mongoose.Schema;

var userSchema = Schema({
  name    : String,
  password    : String,
  following : [{ref: 'User', type: 'ObjectId'}],
  followers : [{ref: 'User', type: 'ObjectId'}],
  liked_tweets : [{ref: 'Post', type: 'ObjectId'}],
});

/* Method that updates both following and followers list of relevant users when one follows the other. */
userSchema.methods.follow_user = function(other_user) {
	if (this.following.indexOf(other_user) === -1) {
		this.following.push(other_user);		
	}
	if (other_user.followers.indexOf(this) === -1) {
		other_user.followers.push(this);		
	}
	this.save();
	other_user.save();
}

/* All users follow themselves by default. Method to update both following and followers list at once. 
Called when creating a user. */
userSchema.methods.follow_self = function() {
	if (this.following.indexOf(this) === -1) {
		this.following.push(this);		
	}
	if (this.followers.indexOf(this) === -1) {
		this.followers.push(this);		
	}
	this.save();
}

var User = mongoose.model('User', userSchema);

module.exports = User;