// 몽고디비 
var mongoose = require('mongoose');
var connection1 = mongoose.createConnection('mongodb://localhost/banana'); //데이터 베이스에 연결합니다.
var sessionsModel = require('./model_session.js');
var memberModel = require('./model_member.js');


// server_1_1 멤버 모델을 정의합니다.
/*
var members = new Schema({
	email: String,
	pass: String,
	name: String
});
var memberModel = mongoose.model('members', members);
*/


// server_1_2 - 인덱스페이지 라우팅
exports.index = function(req, res){
	res.render('index', {});
};

/*
// server_1_3 - 메인페이지 라우팅
exports.main = function(req, res){
  res.render('lobby', { title: 'Banana' });
};
*/

// server_1_4 - 회원가입 함수 member_insert();
exports.member_insert = function(req, res) {
	var email = req.body.join_email;
	var pass = req.body.join_pass;
	var name = req.body.join_name
	var photo = "/images/a.png"
	var nation = "Welcome"
	var city = "Banana City"
	var total_comment = 0
	var total_info = 0
	var total_friend = 0 
	var member_bean = new memberModel();
	
	member_bean.email = email;
	member_bean.pass = pass;
	member_bean.name = name;
	member_bean.photo = photo;
	member_bean.nation = nation;
	member_bean.city = city;
	member_bean.total_comment = total_comment;
	member_bean.total_info = total_info;
	member_bean.total_friend = total_friend;

	member_bean.save(function (err) {
		if (err) {
			console.log("fail");
			throw err;
		}
		else {
			console.log("success");
			res.json({status: "가입을 환영합니다. 로그인해 주세요."});
		}
	});
};

// server_1_5 - 로그인 함수 member_select();
exports.member_select = function(req, res) {
	var id = req.body.login_id;
	var pass = req.body.login_pass;
	memberModel.findOne({'email':id,'pass':pass},function(err,data)
	{
		if(err){
			res.json({status:"FAIL"});
			throw err;
		}else{
			
			if(data!=null){

					var Value_match = new RegExp(data.email);
					sessionsModel.findOne({'session' : Value_match },function(err,ck_sessions){
						if(err){
							res.json({status:"FAIL"});
							throw err;
						}else{						
							if(ck_sessions==null){
								console.log('data.email='+JSON.stringify(data.email));
								console.log('ck_sessions='+ck_sessions);
								
								req.session.userid=data._id;
								console.log('****************_id = '+ req.session.userid);
								req.session.photo=data.photo;
								req.session.email=data.email;
								req.session.name=data.name;
								req.session.birth=data.birth;
								req.session.nation=data.nation;
								req.session.city=data.city;


								res.json({status: "SUCCESS"});
							}else{
								console.log("*********LOGIN:MULTILOGIN**********'\'{}\''");
								console.dir(JSON.stringify(ck_sessions));
								res.json({status: "MULTILOGIN"});
							}						
						}
					});				

			}else{
				console.log("*********LOGIN:NODATA**********");
				res.json({status: "NODATA"}); //회원 데이터
			}	



		}//}else{
	});
};
		
				
// server_1_6 - 재로그인 함수 member_select_re();
exports.member_select_re = function(req, res) {
	var id = req.body.login_id;
	var pass = req.body.login_pass;
	memberModel.findOne({'email':id,'pass':pass},function(err,data)
	{
		if(err){
			res.json({status:"FAIL"});
			throw err;
		}else{
			
			if(data!=null){

					var Value_match = new RegExp(data.email);
					sessionsModel.findOne({'session' : Value_match },function(err,ck_sessions){
						if(err){
							res.json({status:"FAIL"});
							throw err;
						}else{
							console.log('찾았다='+ck_sessions);
							if(ck_sessions!=null){
								
								sessionsModel.remove({'session' : Value_match },function(err,del_sessions){
									if(err){
										res.json({status:"FAIL"});
										throw err;
									}else{
										console.log('지웟다='+del_sessions);
										
										req.session.userid=data._id;
										console.log('****************_id = '+ req.session.userid);
										req.session.photo=data.photo;
										req.session.email=data.email;
										req.session.name=data.name;
										req.session.birth=data.birth;
										req.session.nation=data.nation;
										req.session.city=data.city;
										res.json({status: "SUCCESS"});
									};
								});
								
							}else{
								res.json({status:"FAIL"});//세션에 값이 없는데 재로그인 호출됨
							}						
						}
					});				

			}else{
				console.log("*********LOGIN:NODATA**********");
				res.json({status: "NODATA"}); //회원 데이터
			}	



		}//}else{
	});
};














































				/*
				console.dir(JSON.stringify(ck_sessions));

				sessionsModel.findOne({'email' : /data.email/ },function(err,session_data)
				{
					if(err){
						res.json({status:"FAIL"});
						console.log("*********LOGIN:FAIL**********");
						throw err;
					}else{
						if(session_data==null){
							console.log("********session_datea"+session_data);
							req.session.email=data.email;
							req.session.name=data.name;
							req.session.photo='/images/photo_middel.jpg';
							res.json({status: "SUCCESS"});
							console.log("*********LOGIN:SUCCESS**********");
							console.log(req.session.name+" "+req.session.id);
						}else{
							console.log("*********LOGIN:MULTILOGIN**********");
							res.json({status: "MULTILOGIN"});
						}
					}
				});

				*/


/*
				MongoClient.connect('mongodb://localhost:27017/banana', function(err,db){
					if(err) throw err;					
					var cursor=db.collection('sessions').find({'session':/id/});
					cursor.each(function(err , ck_sessions){
						
						if(err){
							res.json({status:"FAIL"});
							console.log("*********LOGIN:FAIL**********");
							throw err;
							return db.close();
						}else{						
							if(ck_sessions==null){
								console.log("********ck_sessions= "+ck_sessions);
								console.log("data.email = "  +data.email);
								console.log("req.session.name= "  +req.session.name+" "+req.session.id);


								req.session.email=data.email;
								req.session.name=data.name;
								req.session.photo='/images/photo_middel.jpg';
								res.json({status: "SUCCESS"});
							}else{
								res.json({status: "MULTILOGIN"});
								console.log("*********LOGIN:MULTILOGIN**********'\'{}\''");
//								console.log("data.email=" data.email);
								console.log("*********LOGIN:MULTILOGIN**********'\'{}\''");
								console.dir(JSON.stringify(ck_sessions));
								res.json({status: "MULTILOGIN"});
							}						
						}


					});
				});

*/


/*
				MongoClient.connect('mongodb://localhost:27017/banana', function(err,db){
				if(err){
					throw err;
					console.log(err);
				}
					console.log("###################################################");
					db.collection('sessions').find({session:/db.email/}),function(err,ck_sessions){
						if(err){
							console.log("*********LOGIN:FAIL**********");
							res.json({status:"FAIL"});
							
		 					throw err;
							return db.close();
						}else{						
							if(ck_sessions==null){
								console.log('data.email='+JSON.stringify(data.email));
								console.log('ck_sessions='+ck_sessions);
								console.log('query='+query);

								req.session.email=data.email;
								req.session.name=data.name;
								req.session.photo='/images/photo_middel.jpg';
								res.json({status: "SUCCESS"});
							}else{
								console.log("*********LOGIN:MULTILOGIN**********'\'{}\''");
								console.log('id='+id);
								console.log('ck_sessions='+ck_sessions);
								console.log('data.email='+JSON.stringify(data.email));
								console.log("*********LOGIN:MULTILOGIN**********'\'{}\''");
																console.dir(JSON.stringify(ck_sessions));
								res.json({status: "MULTILOGIN"});
							}						
						}
					};
				});				

			}
			else{
				console.log("*********LOGIN:NODATA**********");
				res.json({status: "NODATA"}); //회원 데이터
			}	
*/		