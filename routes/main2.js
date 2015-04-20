var mongoose = require('mongoose');
var connection2 = mongoose.connect('mongodb://localhost/banana');
var sessionsModel = require('./model_session.js');


// server_2_2 - 메인페이지 라우팅
exports.index = function(req, res){
	res.render('main2', {});
};


// server_2_3 - 친구목록 불러오기
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

// server_2_4 -  내 프로필 불러오기
exports.main_my_profile =   function(req, res) {
	res.json(req.session);
};
