var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var good_list = new Schema({
	userid: String,
	name: String,
	ts : Date
});
module.exports = mongoose.model('good_list', good_list);