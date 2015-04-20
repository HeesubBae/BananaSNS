var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postsSchema

// server__1 wall 에 저장할 모델을 만듭니다.
var wall = new Schema({
	userid: String,
	month: String,
	posts: [postsSchema]
});
module.exports = mongoose.model('wall', wall);