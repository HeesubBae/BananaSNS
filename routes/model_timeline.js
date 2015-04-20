var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema;

var timeline = new Schema({
	id: String,
	userid: String,
	name : String,
	photo : String,
	text: String,
	likes : Number,
	comment_counts: Number,
	date : Date,
	comment : [CommentSchema]
});
module.exports = mongoose.model('timelines', timeline);
