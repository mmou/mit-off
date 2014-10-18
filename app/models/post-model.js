var mongoose = require('./mongoose');

var Schema = mongoose.Schema;

var postSchema = Schema({
  _creator : { type: 'ObjectId', ref: 'User' },
  name : String,
  post    : String,
  likers : [{ref: 'User', type: 'ObjectId'}],
});

/* Method called to populate News Feed. */
postSchema.statics.display_feed = function (current_user, cb) {
	return this.model("Post").find({}).where('_creator').in(current_user.following).populate('likers').sort('_id').exec(cb);
}

/* Method called when user likes a post. Updates both the likers' list in the post and the liked_tweets list in the user. */
postSchema.methods.like_post = function(user) {
	var isUserInArray = this.likers.some(function(element) {
		return element.equals(user._id);
	});

	if (!isUserInArray) {
		this.likers.push(user);
		user.liked_tweets.push(this);
	}

	this.save();
	user.save();
}

var Post = mongoose.model('Post', postSchema);

module.exports = Post;