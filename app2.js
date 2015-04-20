//모듈을 추출합니다.
var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var engine = require('ejs-locals')
var routes = require('./routes/');
var main = require('./routes/main2');
var path = require('path');
var mongodb = require('mongodb')
//** Connect 시 socket 정보 저장을 위해 Connect,Cookie,Connect-mongo 이용**//
var connect = require('connect');
var cookie = require('cookie');
var MongoStore = require('connect-mongo')(express);
var session_store = new MongoStore({url: 'mongodb://localhost:27017/banana'});
var MongoClient =require('mongodb').MongoClient;


//웹 서버를 생성합니다.
var app =express();

//웹 서버 환경 설정을 합니다.
app.set('port', process.env.PORT || 9005); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//fileUpload
app.use(express.limit('2mb'));
app.use(express.bodyParser({ uploadDir: __dirname + '/public/files'}));

//session
app.use(express.cookieParser());
app.configure(function(){
		app.use(express.session({store : session_store,secret: "keyboard cat"}));
});

app.use(app.router); //반드시 session 뒤에 와야 한다.
app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs',engine);

//development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//API를 위한 페이지 라우팅을 처리합니다.
app.get('/', routes.index);
app.post('/member_insert', routes.member_insert);
app.post('/member_select', routes.member_select);
app.post('/member_select_re', routes.member_select_re);
app.get('/main', main.index);
app.post('/main_my_profile', main.main_my_profile);
app.get('/member_list', main.member_list);

app.post('/files',function(req,res){
	console.log(JSON.stringify(req.files));
	var serverPath = '/files/' + req.files.userPhoto.name;
 
	require('fs').rename(req.files.userPhoto.path,
						'/home/magicmode/banana/public' + serverPath,
						function(error) {
							if(error) {
								res.send({error: 'Ah crap! Something bad happened'});
								return;
							} 
							res.send({path: serverPath});
						});
});
//웹 서버를 실행합니다.
var server=http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
//
extend = function(destination, source) {   
for (var property in source) {
		destination[property] = source[property];
	}
	return destination;
};

//소켓서버를 생성합니다.
var io=socketio.listen(server);
function get_connect_sid(socket){
	//소켓ID Session에 Update
	var cookie_string = socket.handshake.headers.cookie;
	var parsed_cookies = 
		connect.utils.parseSignedCookies(cookie.parse(decodeURIComponent(cookie_string)),'keyboard cat');
	var connect_sid = parsed_cookies['connect.sid'];
	return connect_sid;
}

//소켓 연결 이벤트 리스너
io.sockets.on('connection', function(socket){
	console.log('connect');
	var connect_sid = get_connect_sid(socket);
	if (connect_sid) {
		session_store.get(connect_sid, function (error, session) {
			session.socketID = socket.id;
			session_store.set(connect_sid,session);
			socket.set('session_id',connect_sid);
			console.log('socketID ' + session.socketID);
			io.sockets.sockets[socket.id].emit('ssssss',session);
		});
	}
	

	socket.on('get_session',function(){
		var connect_sid = get_connect_sid(socket);
		if (connect_sid) {
			session_store.get(connect_sid, function (error, session) {
				console.log("session socketid" + session.socketID);
				console.log("mysocketID" + socket.id);
				io.sockets.sockets[socket.id].emit('get_session',session);
				console.log('get_session.socketID ' + session.socketID);
			});
		}	
	});


	//Session TTL 시간 줄여서 Update
	socket.on('disconnect',function(){
		socket.get('session_id',function(error,connect_sid){
				var d = new Date(); d.setSeconds(d.getSeconds() + 10);
				console.log("now = " + new Date() + " after = " + d );
				MongoClient.connect('mongodb://localhost:27017/banana', function(err,db){
				if(err) throw err;
					db.collection('sessions').update({_id: connect_sid },{$set:{expires: d } }, {multi:true},function(err, updated){
						if(err) throw err;
							console.dir(JSON.stringify(updated));
							return db.close();
					});
				});
		});
		socket.get('room', function(error, room){
			if(room==null) return;
			console.log("peer_disconnect - " + room);
			socket.broadcast.to(room).emit('peer_disconnect',socket.id);
		});
	});


	/********************RTC**********************/
	// 화상채팅요청
	socket.on('videocam_req',function(session,socketID) {
		//console.log("videocam_req : " + send_session.email + ", " + send_session.name + ", " + send_session.socketID);
		console.log("session socketID : " + session.socketID);
		console.log("sendsocketID : " + socketID);
		console.log("mysocketID : " + socket.id);
		io.sockets.sockets[socketID].emit('videocam_req',session);
	});
	// 화상채팅요청수락
	socket.on('videocam_res',function(session,socketID,req){
		console.log("videocam_res");
		console.log("mysocketID : " + session);
		console.log("sendsocketID : " + socketID);
		console.log("req : " + req);
		io.sockets.sockets[socketID].emit('videocam_res',session,req);
	});
	//방 생성
	socket.on('create_room',function(session,socketID){
		console.log("create_room - " + session.socketID);
		socket.join(session.socketID);
		socket.set('room',session.socketID);
		io.sockets.sockets[socketID].emit('create_room',session);
	});
	//방 진입 요청
	socket.on('request_join_room',function(session,socketID,room_name){
		console.log("request_join_room");
		io.sockets.sockets[socketID].emit('request_join_room',session,room_name);
	});
	//한명이 들어왔다고 알림
	socket.on('peer_connect',function(session){
		socket.get('room',function(error, room){
			console.log("peer_connect");
			socket.broadcast.to(room).emit('peer_connect', session);
		});
	});
	//방에 들어감
	socket.on('join_room',function(sender_session,recv_session,room_name){
		console.log("join_room");
		socket.join(room_name);
		socket.set('room',room_name);
		io.sockets.sockets[recv_session.socketID].emit('join_room',sender_session,recv_session);
	});
	//접속자 세션 리스트를 보냄
	socket.on('send_connlist',function(session,socketID,list){
		console.log("send_connlist " + list.length);
		io.sockets.sockets[socketID].emit('start_rtc',session,list);
	});
	socket.on('connect', function(message){
	});
	socket.on('message', function(message) {
		console.log("Message: " + message);
		var recv = message.receiver.socketID;
		//console.log("idx: " + message.receiver.socketID);
		io.sockets.sockets[recv].emit('message',message);
		//console.log("Message: " + message.type + "Receiver : "+message.receiver.email);
    });
	//draw 이벤트 - 사용자가 캔버스 위에 그림을 그릴 때 마우스 좌표를 전달하는 이벤트
	socket.on('draw', function (data){
		socket.get('room', function(error, room){
			io.sockets.in(room).emit('line', data);
		});
	});
	//채팅
	socket.on('room_chat', function(session,msg){
		socket.get('room',function(error,room){
			socket.broadcast.to(room).emit('recv_room_chat',session,msg);
			io.sockets.sockets[socket.id].emit('recv_my_room_chat',msg);
		});
	});
	//사진업로드
	socket.on('photo_upload', function(path){
		socket.get('room',function(error,room){
			socket.broadcast.to(room).emit('photo_upload',path);
			io.sockets.sockets[socket.id].emit('photo_upload',path);
		});
	});
	/***************************RTC 끝****************************/

	socket.on('input_chat',function(socketID,session,message){
		console.log("input_chat" + socketID);
		io.sockets.sockets[socketID].emit('recv_chat',session,session.socketID,message);
		io.sockets.sockets[socket.id].emit('recv_my_chat',socketID,message);
	});
});




/* ***********************************************************************

				var MongoClient =require('mongodb').MongoClient;
				var d = new Date(); d.setMinutes(d.getMinutes() + 3);
				console.log("now = " + new Date() + " after = " + d );
				MongoClient.connect('mongodb://localhost:27017/banana', function(err,db){
				if(err) throw err;
					db.collection('sessions').update({},{$set:{expires: d } }, {multi:true},function(err, updated){
						if(err) throw err;
							console.dir(JSON.stringify(updated));
							return db.close();
					});
				});



// 몽고디비 
var mongoose = require('mongoose');
var connect3=mongoose.createConnection('mongodb://localhost/banana');

var Schema = mongoose.Schema;

// server_2_1 친구 모델을 정의합니다.
var sessions2 = new Schema({
	email: String,
	name: String,
	photo : String,
	socketID : String
});
var sessions = mongoose.model('sessions', sessions);


			var mongoose = require('mongoose');
			var connect3=mongoose.createConnection('mongodb://localhost/banana');
			connect3.sessions.update( { _id: " "}, { $set : {expires : new Date() } }, { multi: true) );
*/
