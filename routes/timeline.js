var mongoose = require('mongoose');
var commentsModel = require('./model_comments.js');
var good_listModel = require('./model_good_list.js');
var postsModel = require('./model_post.js');
var wallModel = require('./model_wall.js');
var membersModel = require('./model_member.js');
var MongoClient =require('mongodb').MongoClient; // update 시 이용

exports.load_timeline = function(req, res){

	var userid=req.body.userid;
	console.log("timeline_id="+userid);
	membersModel.findOne({_id: userid},{_id:0,friends_id:1},function(err,data)
	{

		var Value_match = new RegExp(JSON.stringify(data.friends_id));
		
		console.log("Value_match ="+Value_match)

	MongoClient.connect("mongodb://localhost:27017/banana", function(err, db) {
		  // Create a collection
			db.collection('walls', function(err, collection) {
					// Insert the docs
					collection.find(function(err, data) {
						collection.aggregate({$match: {userid:{$in:[Value_match]}}},{$project: {posts: 1,_id:1}}, {$unwind: "$posts"},{$sort:{'posts.ts':1}}
						//db.walls.aggregate({$match:{userid:{$in:["5380629ea3b31f864f000001","53806aac12c75f4b51000001"]}}},{$project: {posts: 1,_id:0}}, {$unwind: "$posts"}})
						, function(err, result) {
							  res.json(result);
							 // console.log(result);
							  
							  console.log("결과");
							  //db.close();
						  });
				  });
			});
		});


	});
}


exports.load_wall = function(req, res){

	var userid=req.body.userid;
	MongoClient.connect("mongodb://localhost:27017/banana", function(err, db) {
		  // Create a collection
			db.collection('walls', function(err, collection) {
					// Insert the docs
					collection.find(function(err, data) {
						collection.aggregate({$match: {userid:userid}},{$project: {posts: 1,_id:1}}, {$unwind: "$posts"} ,{$sort:{'posts.ts':1}}
						//db.walls.aggregate({$match:{userid:{$in:["5380629ea3b31f864f000001","53806aac12c75f4b51000001"]}}},{$project: {posts: 1,_id:0}}, {$unwind: "$posts"}})
						, function(err, result) {
							  res.json(result);
							  //console.dir(result);
							  
							  console.log("결과");
							  //db.close();
						  });
				  });
			});
		});


}
/*
	wallModel.find({},function(err,data)
	{
		if(err){
			res.json({status:"검색중 오류가 발생했습니다."});
			console.log("wall list fail");
			throw err;
		}else{
			if(JSON.stringify(data).length > 0){
				console.log('데이터*********************'+JSON.stringify(data));
				console.log("************데이터 로드 *******************");
					res.json(data);
			}
			else{
				res.json({status: "찾으시려는 데이터는 존재하지 않습니다."});
				console.log("찾으시려는 데이터는 존재하지 않습니다.");
			}
		}	
	});
	*/


exports.write_timeline = function(req, res){
/*
	id : Schema.Types.ObjectId,
	ts : Date,
	userid: String,
	name: String,
	circles:[ String ]
	detail: {text:String, photo:String},
	comment_count: Number,
	comments: [comments]
	good_count: Number,
	good_list:[good_list]

var wall = new Schema({
	userid: String,
	name: String,
	month: String,
	posts: [posts]
});
*/

	var now = new Date();
	var nowMonth = now.getMonth() + 1; 

	var wallModel_bean = new wallModel();

	wallModel_bean.userid = req.body.userid;
	wallModel_bean.name = req.body.username;
	wallModel_bean.month = nowMonth;
	
	
	wallModel_bean.posts.postid = new mongoose.Schema.ObjectId;
	wallModel_bean.posts.ts = new Date();
	wallModel_bean.posts.userid = req.body.userid;
	wallModel_bean.posts.name = req.body.name;
	wallModel_bean.posts.circles = 'public';
	wallModel_bean.posts.text = req.body.text;
	//postsModel_bean.photo.photo=req.body.photo;
	wallModel_bean.posts.comment_count = 0;
	wallModel_bean.posts.good_count = 0;
	

	wallModel.findOne({userid:req.body.userid , month:nowMonth},function (err,myWall) {
		if (err) {
			console.log("글 등록중 오류 발생");
			throw err;
		}else {
			console.log(JSON.stringify(myWall));
			if(!isEmpty(myWall)){
				myWall.posts.addToSet(
					{postid:new mongoose.Types.ObjectId,
					 ts:new Date(),
					 userid:req.body.userid,
					 name : req.body.name,
					 circles : 'public',
					 text : req.body.text,
					 comment_count:0,
					 good_count:0,
					 comments: [],
					 good_list: []
					}
				);
				myWall.save(function(error){
						if(error){
						res.json({status:"글등록중 오류가 발생했습니다."});
							throw error
						}else{
							plus_total_info(req.body.userid);
							res.json({status:"글등록이 완료 되었습니다.1"});	
						}
				});
			}
			else{
				wallModel_bean.save(function (err) {
					if (err) {
						console.log("save fail");
						throw err;
					}
					else{
						wallModel.findOne({userid:req.body.userid , month:nowMonth},function (err,myWall) {
						if(!isEmpty(myWall)){
							myWall.posts.addToSet(
								{postid:new mongoose.Types.ObjectId,
								 ts:new Date(),
								 userid:req.body.userid,
								 name : req.body.name,
								 circles : 'public',
								 text : req.body.text,
								 comment_count:0,
								 good_count:0,
							     comments: [],
								 good_list: []
								}
							);
							myWall.save(function(error){
									if(error){
									res.json({status:"글등록중 오류가 발생했습니다."});
										throw error
									}else{
										plus_total_info(req.body.userid);
										res.json({status:"글등록이 완료 되었습니다.1"});	
									}
							});
						}
						});
					}
				});				
			}
		}
	});
}


/*

	wallModel_bean.save(function (err) {
		if (err) {
			console.log("fail");
			throw err;
		}
		else {
			console.log("success");
			res.json({status: "글등록이 완료 되었습니다."});
		}
	});
*/


exports.write_comment = function(req, res){

	var wallid =req.body.wallid;
	var postid =req.body.postid;
	var userid = req.body.userid;
	var name = req.body.name;
	var text = req.body.text;
	var date = new Date();
	console.log("wallid"+wallid);
	console.log("postid"+postid);
	var pid = mongoose.Types.ObjectId(postid);
	var wid = mongoose.Types.ObjectId(wallid);

	wallModel.findOne({_id: wallid},{_id:0,posts:{$elemMatch:{postid:pid}}},function (err,myWall) {
		console.dir(myWall);
		console.log(myWall.posts[0].comment_count);
			wallModel.update(
				{_id: wid, 'posts.postid':pid },
				{'$addToSet':{'posts.$.comments':{ userid:userid, name:name, ts:new Date(), text:text}},
				'$set':{'posts.$.comment_count':myWall.posts[0].comment_count+1}
			},function(error)
			{
				if(error){
					res.json({status:"0"});
						throw error
				}else{
					console.log("update ");
					res.json({status:"1"});
				}
			});
	});
}


exports.write_good = function(req, res){

	var wallid =req.body.wallid;
	var postid =req.body.postid;
	var userid = req.body.userid;
	var name = req.body.name;
	var date = new Date();
	console.log("wallid"+wallid);
	console.log("postid"+postid);
	var pid = mongoose.Types.ObjectId(postid);
	var wid = mongoose.Types.ObjectId(wallid);

	wallModel.findOne({_id: wallid},{_id:0,posts:{$elemMatch:{postid:pid}}},function (err,myWall) {
		console.dir(myWall);
		console.log(myWall.posts[0].good_count);
			wallModel.update(
				{_id: wid, 'posts.postid':pid },
				{'$addToSet':{'posts.$.good_list':{ userid:userid, name:name, ts:new Date()}},
				'$set':{'posts.$.good_count':myWall.posts[0].good_count+1}
			},function(error)
			{
				if(error){
					res.json({status:"0"});
						throw error
				}else{
					console.log("update ");
					res.json({status:"1"});
				}
			});
	});
}
/*
	MongoClient.connect("mongodb://localhost:27017/banana", function(err, db) {
		  // Create a collection
			db.collection('walls', function(err, collection) {
					// Insert the docs
					collection.find(function(err, data) {
						collection.aggregate(
							{$match: {userid:userid}},
							{$project: {posts: 1,_id:0}},
							{$unwind: "$posts"},
							{$match: {'posts.postid':pid}}
						, function(err, result) { 
								console.dir(result);
								console.log("comment_count"+result.comment_count);
*/
/*
								wallModel.update({userid: userid, 'posts.postid':pid },
									{$addToSet:{'posts.$.comments':{ userid:userid, name:name, ts:new Date(), text:text}
									 ,'$set':{comment_count:result.comment_count+1}
									}
								
								},function(error)
								{
									if(error){
										res.json({status:"0"});
											throw error
									}else{
										console.log("update ");
										res.json({status:"1"});
									}
								});
*/
/*
						  });
				  });
			});
		});
*/

/*	wallModel.aggregate({$match: {userid:userid}},{$project: {posts: 1,_id:0}},{$unwind: "$posts"},{$match: {'posts.postid':pid}},function(err,myWall)
	{
		if(err){
			console.log("myWall fail");
			throw err;
		}else{
			console.dir(JSON.stringify(myWall));
		
			myWall.Set({userid:userid,name:name,ts:new Date(),text:text});
				console.log("addtoset");
				myWall.save(function(error){
						if(error){
							console.log("fail");
							res.json({status:"실패"});
							throw error
						}else{
							console.log("success");
							res.json({status:"성공"});
						}
				});					
			
		}

	});
*/




function getFriendsId(userid){
	membersModel.findOne({_id: userid},{_id:0,friends_id:1},function(err,data)
	{
		console.log(data.friends_id);	
		return data.friends_id;
	});

}

function plus_total_info(userid){
	membersModel.findOne({_id: userid},function(err,data)
	{
		console.log("total_info="+data.total_info);
		if(err){
			res.json({status:"검색중 오류가 발생했습니다."});
			console.log("member_list fail");
			throw err;
		}else{
			membersModel.update({_id: userid,},{'$set':{total_comment:data.total_comment+1}},function(error)
			{
				if(error){
					console.log("total_info update Error");
					throw error
				}else{
					console.log("+1");
				}
			});
		}
	});
}


function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;
 
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;
 
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
 
    return true;
}