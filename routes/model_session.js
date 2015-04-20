var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// server__1 Session 에 저장할 모델을 만듭니다.
var sessions = new Schema({
	userid: String,
	email: String,
	name: String,
	photo : String,
	birth : String,
	nation : String,
	city : String,
	socketID : String
});
module.exports = mongoose.model('sessions', sessions);
