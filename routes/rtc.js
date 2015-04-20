// 몽고디비 
var mongoose = require('mongoose');
var connect2=mongoose.createConnection('mongodb://localhost/banana');

var Schema = mongoose.Schema;

// server_2_1 친구 모델을 정의합니다.
var sessions = new Schema({
	email: String,
	name: String,
	photo : String,
	socketID : String
});
//var sessionsModel = mongoose.model('sessions', sessions);
var post_id;

// server_2_2 - 메인페이지 라우팅
exports.index = function(req, res){
	res.render('rtc', {});
	console.log("post - " + req.body.rtc_id);
	myid = req.body.rtc_id;

};
exports.post_id = function(req, res){
	res.json(myid);
};
//server_2_3 - 친구목록 불러오기
exports.member_list =   function(req, res) {
	sessionsModel.find({},function(err,data)
	{
		if(err){
			res.json({status:"FAIL"});
			console.log("member_list fail");
			throw err;
		}else{
			if(JSON.stringify(data).length > 0){
				res.json(data);
			}
			else{
				console.log("*********친구목록실패**********");
				res.json({status: "FAIL"});
			}
		}	
	});
};	
