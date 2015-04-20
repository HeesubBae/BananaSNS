var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var requestSchema;
var responseSchema;
var friendsSchema;

// server__1 Session 에 저장할 모델을 만듭니다.
var members = new Schema({
	id: String,
	email: String,
	name: String,
	pass: String,
	photo : String,
	socketID : String,
	birth : String,
	sex : String,
	nation : String,
	city : String,
	language : String,
	blood_type : String,
	like : String,
	hobby : String,
	married : String,
	cover_bg : String,
	cover_text : String,
	total_comment : Number,
	total_info : Number, 
	total_friend : Number,
	cover_bg : String,
	friends_id :[String],
	friends : [friendsSchema]
});
module.exports = mongoose.model('members', members);
