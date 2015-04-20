var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var comments = new Schema({
	userid: String,
	name: String,
	ts : Date,
	text : String
});
module.exports = mongoose.model('comments', comments);