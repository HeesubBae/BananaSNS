var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var commentsModel = require('./model_comments.js');
//var good_listModel = require('./model_good_list.js');

var commentsModel;
var good_listModel;

var posts = new Schema({
	postid : Schema.Types.ObjectId,
	ts : Date,
	userid: String,
	name: String,
	circles:[ String ],
	text:String, 
	photo:String,
	comment_count: Number,
	comments: [commentsModel],
	good_count: Number,
	good_list:[good_listModel]
});

module.exports = mongoose.model('posts', posts);

