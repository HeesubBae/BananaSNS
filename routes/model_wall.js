var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postsSchema

// server__1 wall �� ������ ���� ����ϴ�.
var wall = new Schema({
	userid: String,
	month: String,
	posts: [postsSchema]
});
module.exports = mongoose.model('wall', wall);