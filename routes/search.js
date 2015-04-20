var mongoose = require('mongoose');
var membersModel = require('./model_member.js');
var mongodb = require('mongodb')
var MongoClient =require('mongodb').MongoClient; // update 시 이용
var MongoClient1 =require('mongodb').MongoClient; // update 시 이용


var ObjectId = require('mongoose').Types.ObjectId; 

// 전체 사용자 검색페이지
exports.search_key = function(req, res){
	var search_key = req.body.search_key;

	var Value_match = new RegExp(search_key);

	membersModel.find({name: Value_match},function(err,data)
	{

		if(err){
			res.json({status:"검색중 오류가 발생했습니다."});
			console.log("member_list fail");
			throw err;
		}else{
			if(JSON.stringify(data).length > 0){
				console.log(JSON.stringify(data));
				console.log("************데이터 로드 *******************");
					res.json(data);
				
			}
			else{
				res.json({status: "찾으시려는 데이터는 존재하지 않습니다."});
				console.log("찾으시려는 데이터는 존재하지 않습니다.");
			}
		}	
	});
	
};


// 내가 요청한 사용자 검색
exports.request_friend_list = function(req, res){
var userid=req.body.userid;
var Value_match = new RegExp(userid);
var id = mongoose.Types.ObjectId(userid);
console.log("내아이디"+userid);
/*
		MongoClient.connect('mongodb://localhost:27017/banana', function(err,db){
				if(err) throw err;
					db.collection('members').aggregate({$match: {_id:userid}},function(err,data){
						if(err){
								res.json({status:"내가 요청한 친구 검색중 오류가 발생했습니다."});
								console.log("내가 요청한 친구 검색중 오류가 발생했습니다.");
								throw err;
								}else{
										if(JSON.stringify(data).length > 0){
											console.log("data= "+data);
											console.log(JSON.stringify(data));
											console.log("************내가 요청한 친구 데이터 로드 *******************");
											res.json(data);
										}else{
											res.json({status: "내가 요청한 친구 데이터는 존재하지 않습니다."});
											console.log("내가 요청한 친구 데이터는 존재하지 않습니다.");
										}
								}	
					});
		});
*/

MongoClient.connect("mongodb://localhost:27017/banana", function(err, db) {
  // Create a collection
		  db.collection('members', function(err, collection) {
			// Insert the docs
			collection.find(function(err, data) {
				collection.aggregate({$match: {_id:id}},{$project: {friends: 1,_id:0}}, {$unwind: "$friends"}, {$match: {"friends.status": 0}}
				, function(err, result) {
				  res.json(result);
				  console.dir(result);
				  console.log("결과");
				  db.close();
			  });
		  });
		});
	});
};

//	membersModel.find({_id: userid,friends:{status:0}},{_id:0,'friends':1,},function(err,data)
//	db.members.aggregate  ({$match: {_id:userid}},{$project: {friends: 1}}, {$unwind: "$friends"},{$match: {"friends.status": 0}})
//	membersModel.aggregate({$match: {_id:userid}},{$project: {friends: 1}}, {$unwind: "$friends"},{$match: {"friends.status": 0}},function(err,data){
//	membersModel.aggregate([
//		{$match:{_id:userid}}
//	]).exec(function(err,data){
//	membersModel.aggregate({$match: {_id:Value_match}},function(err,data){
/*		if(err){
			res.json({status:"내가 요청한 친구 검색중 오류가 발생했습니다."});
			console.log("내가 요청한 친구 검색중 오류가 발생했습니다.");
			throw err;
		}else{
			if(JSON.stringify(data).length > 0){
				console.log("data= "+data);
				console.log(JSON.stringify(data));
				console.log("************내가 요청한 친구 데이터 로드 *******************");
					res.json(data);
			}
			else{
				res.json({status: "내가 요청한 친구 데이터는 존재하지 않습니다."});
				console.log("내가 요청한 친구 데이터는 존재하지 않습니다.");
			}
		}	
	});
*/	


//나에게 요청한 친구 검색
exports.response_friend_list = function(req, res){
	var userid=req.body.userid;
	var id = mongoose.Types.ObjectId(userid);

	console.log("나에게요청한 친구검색");
	MongoClient1.connect("mongodb://localhost:27017/banana", function(err, db) {
	  // Create a collection
		db.collection('members', function(err, collection) {
				// Insert the docs
				collection.find(function(err, data) {
					collection.aggregate({$match: {_id:id}},{$project: {friends: 1,_id:0}}, {$unwind: "$friends"}, {$match: {"friends.status": 1}}
					, function(err, result) {
						  res.json(result);
						  console.dir(result);
						  console.log("결과");
						  //db.close();
					  });
			  });
		});
	});
};

/*
	membersModel.aggregate({$match: {_id:id}},{$project: {friends: 1,_id:0}}, {$unwind: "$friends"}, {$match: {"friends.status": 1}},function(err,data)
	{
		if(err){
			res.json({status:"나에게 요청한 친구 검색중 오류가 발생했습니다."});
			console.log("나에게 요청한 친구 검색중 오류가 발생했습니다.");
			throw err;
		}else{
			if(JSON.stringify(data).length > 0){
				console.log(JSON.stringify(data));
				console.log("************나에게 요청한 친구 데이터 로드 *******************");
					res.json(data);
			}
			else{
				res.json({status: "나에게 요청한 친구 찾으시려는 데이터는 존재하지 않습니다."});
				console.log("나에게 요청한 친구 찾으시려는 데이터는 존재하지 않습니다.");
			}
		}	
	});
*/	


// 내 친구 리스트 검색
exports.my_friend_list = function(req, res){
	var userid=req.body.userid;
	var id = mongoose.Types.ObjectId(userid);

	console.log("나에게요청한 친구검색");
	MongoClient1.connect("mongodb://localhost:27017/banana", function(err, db) {
	  // Create a collection
		db.collection('members', function(err, collection) {
				// Insert the docs
				collection.find(function(err, data) {
					collection.aggregate({$match: {_id:id}},{$project: {friends: 1,_id:0}}, {$unwind: "$friends"}, {$match: {"friends.status": 2}}
					, function(err, result) {
						  res.json(result);
						  console.dir(result);
						  console.log("결과");
						  //db.close();
					  });
			  });
		});
	});
};



// 내 친구 리스트 검색
/*
exports.my_friend_list = function(req, res){
	var userid=req.body.userid;
	var search_key = req.body.search_key;
//	var Value_match = new RegExp(k);
	console.log(userid);
//	membersModel.find({_id: userid,'friends.status':0},{_id:0,'friends.$':1},function(err,data)
//	membersModel.find({_id: userid,friends:{$elemMatch:{status:3}}},{_id:0},function(err,data)
//	membersModel.find({_id: userid,friends:{status:{$gt:2}}},{_id:0},function(err,data)
//	membersModel.find({_id: userid,'friends.status':{$all:[3]}},function(err,data)
//	membersModel.find({_id: userid,'friends.status':3},{_id:0,'friends.$':1,},function(err,data)
	var id = mongoose.Types.ObjectId(userid);
	membersModel.findOne({_id: id},function(err,responser){

		if(err){
			res.json({status:"검색중 오류가 발생했습니다."});
			console.log("member_list fail");
			throw err;
		}else{
			
			res_userid=responser._id;
				
				responser.find({_id:id},{friends:{$elemMatch:{status:2}}},{_id:1,'friends.$':1},function(err,data)
				{
					if(err){
						res.json({status:"내 친구 리스트 검색중 오류가 발생했습니다."});
						console.log("내 친구 리스트 검색중 오류가 발생했습니다.");
						throw err;
					}else{
						if(JSON.stringify(data).length > 0){
							console.log(JSON.stringify(data));
							console.log("************내 친구 리스트 데이터 로드 *******************");
								res.json(data);
						}
						else{
							res.json({status: "내 친구 리스트 데이터는 존재하지 않습니다."});
							console.log("내 친구 리스트 데이터는 존재하지 않습니다.");
						}
					}	
				});

		}
	});
*/

/*
	membersModel.find({_id: userid},{friends:{$elemMatch:{status:2}}},{_id:1,'friends.$':1},function(err,data)
	{
		if(err){
			res.json({status:"내 친구 리스트 검색중 오류가 발생했습니다."});
			console.log("내 친구 리스트 검색중 오류가 발생했습니다.");
			throw err;
		}else{
			if(JSON.stringify(data).length > 0){
				console.log(JSON.stringify(data));
				console.log("************내 친구 리스트 데이터 로드 *******************");
					res.json(data);
			}
			else{
				res.json({status: "내 친구 리스트 데이터는 존재하지 않습니다."});
				console.log("내 친구 리스트 데이터는 존재하지 않습니다.");
			}
		}	
	});


	
};
	*/