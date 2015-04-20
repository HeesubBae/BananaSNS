var mongoose = require('mongoose');
var membersModel = require('./model_member.js');
var membersModel2 = require('./model_member.js');
var membersModel3 = require('./model_member.js');
var membersModel4 = require('./model_member.js');
var mongodb = require('mongodb')
var MongoClient =require('mongodb').MongoClient; // update 시 이용
//var request_friend_Model = require('./request_friend.js');
var Schema = mongoose.Schema;




// 친구요청하기
exports.new_request_friend = function(req, res){
	var myid = req.body.myid;
	var requester_id = req.body.requester_id;
	
	membersModel.findOne({_id: myid},function(err,requester)
	{
		if(err){
			res.json({status:"검색중 오류가 발생했습니다."});
			console.log("member_list fail");
			throw err;
		}else{
			//console.log(JSON.stringify(data));
			console.log("************데이터 로드 *******************");
				
				membersModel2.findOne({_id: requester_id},function(err,responser){

					if(err){
						res.json({status:"검색중 오류가 발생했습니다."});
						console.log("member_list fail");
						throw err;
					}else{
						
						res_userid=responser._id;
							
									requester.friends.addToSet({user_id:requester_id,user_name:responser.name,user_photo:responser.photo,user_nation:responser.nation,user_city:responser.city,user_birth:responser.birth,status:0 ,request_date:new Date()});
									requester.save(function(error){
											if(error){
											res.json({status:"친구요청중 오류가 발생했습니다."});
												throw error
											}else{
												//res.json({status:"친구요청이 완료되었습니다."});	
											}
									});
									responser.friends.addToSet({user_id:myid     ,user_name:requester.name,user_photo:requester.photo,user_nation:requester.nation,user_city:requester.city,user_birth:requester.birth,status:1 ,request_date:new Date()});
									responser.save(function(error){
											if(error){
											res.json({status:"친구요청중 오류가 발생했습니다."});
												throw error
											}else{
												res.json({status:"친구요청이 완료되었습니다."});	
											}
									});
					}
				});

		}

	});

}


// 요청한 친구 수락하기
exports.new_add_friend = function(req, res){
	var myid = req.body.myid;
	var responser_id = req.body.responser_id;
	console.log("************친구수락시작 *******************");

	membersModel.findOne({_id: myid, 'friends.user_id':responser_id},function(err,requester)
	{
		if(err){
			res.json({status:"검색중 오류가 발생했습니다."});
			console.log("member_list fail");
			throw err;
		}else{
			console.log("************데이터 로드 *******************");

				membersModel2.findOne({_id: responser_id, 'friends.user_id': myid},function(err,responser){

					if(err){
						res.json({status:"검색중 오류가 발생했습니다."});
						console.log("member_list fail");
						throw err;
					}else{

							membersModel.update({_id: myid, 'friends.user_id':responser_id },{'$set':{'friends.$.status':2,total_friend:requester.total_friend+1},'$push':{friends_id:responser_id}},function(error)
							{
								if(error){
									res.json({status:"오류가 발생했습니다."});
										throw error
								}
							});
							membersModel2.update({_id: responser_id , 'friends.user_id': myid },{'$set':{'friends.$.status':2,total_friend:responser.total_friend+1},'$push':{friends_id:myid}},function(error)
							{
								if(error){
									res.json({status:"오류가 발생했습니다."});
										throw error
								}else{
									res.json({status:"요청이 완료 되었습니다."});	
								}
							});	

					}
				});

		}

	});

}


/*
	membersModel.update({_id: myid, 'friends.user_id':responser_id },{'$set':{'friends.$.status':2}},function(error)
	{
		if(error){
			res.json({status:"오류가 발생했습니다."});
				throw error
		}else{
			res.json({status:"요청이 완료 되었습니다."});	
		}
	});
	membersModel2.update({_id: responser_id , 'friends.user_id': myid },{'$set':{'friends.$.status':2}},function(error)
	{
		if(error){
			res.json({status:"오류가 발생했습니다."});
				throw error
		}else{
			res.json({status:"요청이 완료 되었습니다."});	
		}
	});	
}
*/

//	membersModel.remove({_id: myid, 'friends.user_id':responser_id },function(error)	
//#	membersModel.update({_id: myid, 'friends.user_id':responser_id },{'$set':{'friends.$.status':2}},function(error)
//	membersModel.update({_id: myid, 'friends.user_id':responser_id },{$set:{friends:{status:2}}},function(error)
//	membersModel.update({_id: myid},{$pull:{friends:{user_id: responser_id }}},function(error)

//	membersModel2.remove({_id: responser_id , 'friends.user_id': myid },function(error)
//#	membersModel2.update({_id: responser_id , 'friends.user_id': myid },{'$set':{'friends.$.status':2}},function(error)
//	membersModel2.update({_id: responser_id , 'friends.user_id': myid },{$set:{friends:{status:2}}},function(error)
//	membersModel2.update({_id: responser_id},{$pull:{friends:{user_id: myid }}},function(error)



// 친구 삭제하기 -- new
exports.new_del_friend = function(req, res){
	var myid = req.body.myid;
	var responser_id = req.body.responser_id;
	console.log("************친구삭제시작 *******************");

	membersModel.findOne({_id: myid, 'friends.user_id':responser_id},function(err,requester)
	{
		if(err){
			res.json({status:"검색중 오류가 발생했습니다."});
			console.log("member_list fail");
			throw err;
		}else{
			console.log("************데이터 로드 *******************");

				membersModel2.findOne({_id: responser_id, 'friends.user_id': myid},function(err,responser){

					if(err){
						res.json({status:"검색중 오류가 발생했습니다."});
						console.log("member_list fail");
						throw err;
					}else{
							
							membersModel.update({_id: myid, 'friends.user_id':responser_id },{$pull:{friends:{user_id:responser_id}},$set:{total_friend:requester.total_friend-1}},{multi:true},function(error)
							{
								if(error){
									res.json({status:"처리중 오류가 발생했습니다."});
										throw error
								}else{
									res.json({status:"처리가 완료 되었습니다."});	
								}
							});
							membersModel2.update({_id: responser_id , 'friends.user_id': myid },{$pull:{friends:{user_id: myid}},$set:{total_friend:responser.total_friend-1}},{multi:true},function(error)
							{
								if(error){
									res.json({status:"처리중 오류가 발생했습니다."});
										throw error
								}else{
									res.json({status:"처리가 완료 되었습니다."});	
								}
							});		

					}
				});

		}

	});

}


// 친구 삭제하기 --Old
/*exports.new_del_friend = function(req, res){
	var myid = req.body.myid;
	var responser_id = req.body.responser_id;
	console.log("************친구삭제중 *******************");
	console.log(myid);
	console.log(responser_id);
	membersModel.update({_id: myid, 'friends.user_id':responser_id },{$pull:{friends:{user_id:responser_id}}},{multi:true},function(error)
	{
		if(error){
			res.json({status:"처리중 오류가 발생했습니다."});
				throw error
		}else{
			res.json({status:"처리가 완료 되었습니다."});	
		}
	});
	membersModel2.update({_id: responser_id , 'friends.user_id': myid },{$pull:{friends:{user_id: myid}}},{multi:true},function(error)
	{
		if(error){
			res.json({status:"처리중 오류가 발생했습니다."});
				throw error
		}else{
			res.json({status:"처리가 완료 되었습니다."});	
		}
	});	
}
*/

/*
exports.new_add_friend = function(req, res){

	var myid = req.body.myid;
	var responser_id = req.body.responser_id;
console.log(myid);
console.log("responser_id="+responser_id);


	membersModel.findOne({_id: myid},function(err,requester)
	{
		if(err){
			res.json({status:"검색중 오류가 발생했습니다."});
			console.log("member_list fail");
			throw err;
		}else{
			//console.log(JSON.stringify(data));
			console.log("************데이터 로드 *******************");
				
				membersModel2.findOne({_id: responser_id},function(err,responser){

					if(err){
						res.json({status:"검색중 오류가 발생했습니다."});
						console.log("member_list fail");
						throw err;
					}else{
						
						res_userid=responser._id;
									requester.friends.pull({'user_id':responser_id });
//									requester.friends.addToSet({user_id:requester_id,user_name:responser.name,user_photo:responser.photo,user_nation:responser.nation,user_city:responser.city,user_birth:responser.birth,status:0 ,request_date:new Date()});
									requester.save(function(error){
											if(error){
											res.json({status:"친구요청중 오류가 발생했습니다."});
												throw error
											}else{
												//res.json({status:"친구요청이 완료되었습니다."});	
											}
									});
									responser.friends.pull({'user_id':myid });
//									responser.friends.addToSet({user_id:myid     ,user_name:requester.name,user_photo:requester.photo,user_nation:requester.nation,user_city:requester.city,user_birth:requester.birth,status:1 ,request_date:new Date()});
									responser.save(function(error){
											if(error){
											res.json({status:"친구요청중 오류가 발생했습니다."});
												throw error
											}else{
												res.json({status:"친구요청이 완료되었습니다."});	
											}
									});
					}
				});

		}

	});

}
*/