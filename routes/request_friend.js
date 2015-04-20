var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var request_friend = new Schema({
	user_id: String, 
	user_name: String, 
	user_photo: String, 
	request_date :Date
});
module.exports = mongoose.model('request_friend', request_friend);

