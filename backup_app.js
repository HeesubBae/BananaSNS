//����� �����մϴ�.
var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var engine = require('ejs-locals')
var routes = require('./routes/');
var main = require('./routes/main');
var mypage = require('./routes/mypage');
var search = require('./routes/search');
var friend = require('./routes/friend');
var timeline = require('./routes/timeline');
var path = require('path');
var mongodb = require('mongodb')
var MongoClient =require('mongodb').MongoClient; // update �� �̿�
//** Connect �� socket ���� ������ ���� Connect,Cookie,Connect-mongo �̿�**//
var connect = require('connect');
var cookie = require('cookie');
var MongoStore = require('connect-mongo')(express); //session
var session_store = new MongoStore({url: 'mongodb://localhost:27017/banana'});//session


//�� ������ �����մϴ�.
var app =express();

//�� ���� ȯ�� ������ �մϴ�.
app.set('port', process.env.PORT || 9001); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//fileUpload
app.use(express.limit('5mb'));
app.use(express.bodyParser({ uploadDir: __dirname + '/public/files'}));

//session
app.use(express.cookieParser());
app.configure(function(){
		app.use(express.session({store : session_store,secret: "keyboard cat"}));
});

app.use(app.router); //�ݵ�� session �ڿ� �;� �Ѵ�.
app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs',engine);

//development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//API�� ���� ������ ������� ó���մϴ�.
app.get('/', routes.index);
app.post('/member_insert', routes.member_insert);
app.post('/member_select', routes.member_select);
app.post('/member_select_re', routes.member_select_re);
app.get('/main', main.index);
app.post('/main_my_profile', main.main_my_profile);
app.get('/member_list', main.member_list);

app.get('/mypage_cover/:id', mypage.cover);
app.post('/mypage_cover_text_update', mypage.cover_text_update);
app.post('/mypage_cover_info_update', mypage.cover_info_update);


app.post('/search_page_search_key', search.search_key);
app.post('/response_friend_list', search.response_friend_list);
app.post('/request_friend_list', search.request_friend_list);
app.post('/my_friend_list',search.my_friend_list);

app.post('/new_request_friend',friend.new_request_friend);
app.post('/new_add_friend',friend.new_add_friend);
app.post('/new_del_friend',friend.new_del_friend);

app.post('/write_timeline',timeline.write_timeline);
app.post('/load_timeline',timeline.load_timeline);
app.post('/load_wall',timeline.load_wall);
app.post('/write_comment',timeline.write_comment);
app.post('/write_good',timeline.write_good);

//app.post('/modify', routes.modify);
//app.post('/del', routes.del);

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
app.post('/cover_files',function(req,res){
	console.log(JSON.stringify(req.files));
	var serverPath = '/files/' + req.files.cover_change_id.name;
 
	require('fs').rename(req.files.cover_change_id.path,
						'/home/magicmode/banana/public' + serverPath,
						function(error) {
							if(error) {
								res.send({error: 'Ah crap! Something bad happened'});
								return;
							} 
							//res.send({path: serverPath});
						});
});
app.post('/profile_files',function(req,res){
	console.log(JSON.stringify(req.files));
	var serverPath = '/files/' + req.files.profile_change_id.name;
 
	require('fs').rename(req.files.profile_change_id.path,
						'/home/magicmode/banana/public' + serverPath,
						function(error) {
							if(error) {
								res.send({error: 'Ah crap! Something bad happened'});
								return;
							} 
							res.send({path: serverPath});
						});
});


//�� ������ �����մϴ�.
var server=http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//���ϼ����� �����մϴ�.
var io=socketio.listen(server);


//����ID Session�� Update
function get_connect_sid(socket){
	var cookie_string = socket.handshake.headers.cookie;
	var parsed_cookies = 
		connect.utils.parseSignedCookies(cookie.parse(decodeURIComponent(cookie_string)),'keyboard cat');
	var connect_sid = parsed_cookies['connect.sid'];
	return connect_sid;
}

//���� ���� �̺�Ʈ ������
io.sockets.on('connection', function(socket){
	console.log('connect');
	var connect_sid = get_connect_sid(socket);
	if (connect_sid) {
		session_store.get(connect_sid, function (error, session) {
			session.socketID = socket.id;
			session_store.set(connect_sid,session);
			socket.set('session_id',connect_sid);
			console.log('socketID ' + session.socketID);
		});
	}
	

	socket.on('get_session',function(){
		var connect_sid = get_connect_sid(socket);
		if (connect_sid) {
			session_store.get(connect_sid, function (error, session) {
				io.sockets.sockets[socket.id].emit('get_session',session);
				console.log('get_session.socketID ' + session.socketID);
			});
		}	
	});


	//Session TTL �ð� �ٿ��� Update
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
//			session_store.destroy(connect_sid);
		});
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



// ������ 
var mongoose = require('mongoose');
var connect3=mongoose.createConnection('mongodb://localhost/banana');

var Schema = mongoose.Schema;

// server_2_1 ģ�� ���� �����մϴ�.
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
