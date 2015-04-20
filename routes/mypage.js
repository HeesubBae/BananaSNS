var mongoose = require('mongoose');
var membersModel = require('./model_member.js');


// server_2_2 - 메인페이지 라우팅
exports.cover = function(req, res){
	var id=req.param('id')
	console.log("*********가나다라마바사**********");
	membersModel.findOne({_id:req.param('id')},function(err,data)
	{
		if(err){
			res.json({status:"FAIL"});
			console.log("member_list fail");
			throw err;
		}else{
			if(JSON.stringify(data).length > 0){
				if(req.session.userid==data._id){//자기와 넘어오 아이디 일치
					console.log('user_id'+req.session.userid);
					console.log('data_id'+data._id);
					res.json(data); 
				}else{
					res.json(data);
				}
			}
			else{
				console.log("*********회원목록실패**********");
				res.json({status: "FAIL"});
			}
		}	
	});
	//res.json({status: id});
};

// server_2_2 - 커버페이지 text 수정
exports.cover_text_update = function(req, res){
	var cover_text = req.body.cover_text;
	var userid = req.body.userid;
	membersModel.findOneAndUpdate({_id: userid},{cover_text: cover_text},function(err,data)
	{
		if(err){
			res.json({status:"변경중 오류가 발생했습니다."});
			throw err;
		}else{
			if(data!=null){
				res.json({status:"변경이 완료되었습니다."});
			}
			else{
				res.json({status:"변경중 오류가 발생했습니다."});
			}
		}	
	});
};

// server_2_2 - 개인정보 수정
exports.cover_info_update = function(req, res){

	var userid = req.body.userid;
	var birth = req.body.birth;
	var sex = req.body.sex;
	var nation = req.body.nation;
	var city = req.body.city;
	var language = req.body.language;
	var blood_type = req.body.blood_type;
	var like = req.body.like;
	var hobby = req.body.hobby;
	var married = req.body.married;

	membersModel.findOneAndUpdate({_id: userid},{birth: birth, sex:sex, nation:nation, city:city, language:language, blood_type:blood_type, like:like, hobby:hobby, married:married},function(err,data)
	{
		if(err){
			res.json({status:"변경중 오류가 발생했습니다."});
			throw err;
		}else{
			if(data!=null){
				res.json({status:"변경이 완료되었습니다."});
			}
			else{
				res.json({status:"변경중 오류가 발생했습니다."});
			}
		}	
	});
};
