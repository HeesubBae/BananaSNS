/************************************************************************************

							WebRtc를 이용한 화상채팅모듈

************************************************************************************/

var sourcevid;								// 자신의 비디오 엘리먼트
var remotevid = new Array();				// 원격 비디오 엘리먼트 리스트
var remotevid_queue = new Array();			// 원격 비디오 엘리먼트 관리를 위한 큐
var remotevid_form = new Array();			// 원격 비디오 폼의 엘리먼트 리스트
var remotevid_form_queue = new Array();		// 원격 비디오 폼의 엘리먼트 관리를 위한 큐
var connectPeerSession = new Array();		// remotevid 해당하는 세션리스트
var peerConn = new Array();					// remotevid에 해당하는 접속자리스트
var started = new Array();					// peerConn에 해당하는 접속자가 시작이 되었는지에 대한 여부

var isRunRTC = false						// 화상채팅을 하고 있는지
var localStream = null;						// 로컬스트림
var room_name=null;							// 방이름이 무엇인지(방장의 SOCKET_ID)
var timer;									// 타이머
var peerCount = 0;							// 접속자가 몇명 있는지
var grant_request_timer;					// 연결요청을 수신 시 발동 할 타이머

var mediaConstraints = {'mandatory': {'OfferToReceiveAudio': true,'OfferToReceiveVideo': true}};
var moz
 = {'mandatory': {'OfferToReceiveAudio': true,'OfferToReceiveVideo': true, 'MozDontOfferDataChannel': true}};
var browser;								// 자신의 브라우저가 무엇인지

// 브라우저를 구별하여 객체명이 다른 RTC객체들을 맞춰 줌
function distinctionBrowser(){
	if(navigator.userAgent.indexOf("MSIE 8.0") > 0 ){
 		browser="IE8";
	} else if(navigator.userAgent.indexOf("MSIE 7.0") > 0 ) {
 		browser="IE7";
	} else if(navigator.userAgent.indexOf("MSIE 6.0") > 0 ) {
 		browser="IE6";
	} else if(navigator.userAgent.indexOf("Firefox") > 0 ) {
		RTCSessionDescription = mozRTCSessionDescription;
		RTCIceCandidate = mozRTCIceCandidate;
		RTCPeerConnection = mozRTCPeerConnection;
 		browser = "Firefox";
	} else if(navigator.userAgent.indexOf("Chrome") > 0 ) {
		RTCPeerConnection = webkitRTCPeerConnection;
 		browser = "Chrome";
	} else if(navigator.userAgent.indexOf("Safari") > 0 ) {
 		browser = "Safari";
	}
}
	
// RTC 시작함수
function rtc_start() {
	
	// 1_1 화상채팅요청을 받고 요청메시지를 생성함.
	socket.on('videocam_req',function(data){
		recv_videocamReq(data);
		request_timer(data);
	});
	
	// 1_2 화상채팅요청 결과가 허용이면 상단 메시지에 허용을 누르면,
	//     나의 비디오, 오디오 자원을 얻고 원격비디오를 초기화 함.
	//     결과가 허용이 아니면 거절했다고 메시지를 띄움
	socket.on('videocam_res',function(recv_session,req){
		if(req){
			if(!isRunRTC){
				remote_queue_init();
				my_video_init();
				if(browser=="Chrome"){
					timer = setInterval(function(){
						console.log("chrome " + sourcevid.src.length);
						if(sourcevid.src.length!=0){
							send_request_joinRoom(recv_session);
							clearInterval(timer);
							clearTimeout(grant_request_timer);
							isRunRTC = true;
						}
					},400);
				}else if(browser=="Firefox"){
						//alert("aaa" + sourcevid.mozSrcObject);
						timer = setInterval(function(){
							if(sourcevid.mozSrcObject!=null){
								send_request_joinRoom(recv_session);
								clearTimeout(grant_request_timer);
								clearInterval(timer);
								isRunRTC = true;
							}
						},400);
				}
			} else {
				send_request_joinRoom(recv_session);
			}
		}else{
			refuseMessage(recv_session);
		}
	});
	// 1_3 방 생성 완료 메시지를 받음.
	socket.on('create_room', function(recv_session){
		room_name = recv_session.socketID;
		socket.emit('join_room',session,recv_session,room_name);
	});
	
	// 1_4 상대편의 방 입장 요청을 받고, 상대편이 알려준 방에 입장한다는 메시지를 보냄
	socket.on('request_join_room',function(recv_session,room){
		room_name = room;
		socket.emit('join_room',session,recv_session,room_name);
	});
	
	// 1_5 상대방이 방에 입장하였다는 알림을 받음, 내가 가지고 있는 접속리스트를 상대편에게 보냄.
	socket.on('join_room',function(recv_session){
		send_conn_list(recv_session,connectPeerSession);
		document.getElementById('video_chat_draggable1').style.display = 'block';
		document.getElementById('video_chat_draggable6').style.display = 'block';
		document.getElementById('video_chat_draggable_pannel').style.display = 'block';
	});
	
	// 1_6 화상채팅 시작
	socket.on('start_rtc',function(recv_session,list){
		connectPeerSession = list;
		connectPeerSession.push(recv_session);
		peerCount=list.length;
		connect_start();
	});
	
	// 1_7 화상채팅 중, 한 사용자가 초대하고 초대받은 사용자가 수락했을 때 받는 메시지.
	//     초대받은 사용자의 세션과 후에 SDP 메시지 받으면 사용될 비디오 엘리먼트를 PUSH함.
	socket.on('peer_connect', function(session,socketID){
		connectPeerSession.push(session);
		peerCount++;
		remotevid.push(remotevid_queue.shift());
	});
	
	// 1_8 한 사용자가 나갈때의 처리
	socket.on('peer_disconnect',function(data){
		console.log("peer_disconnect + " + data);
		var idx = getConnectSocketIndex(data);
		connectPeerSessionPop(idx);
		
	});
	
	//화상채팅 채널이 열렸다고 알림.
	socket.on('connect', onChannelOpened);
	
	//SDP메시지를 받을 때 이벤트 핸들러
	socket.on('message', onMessage);
}


// 화상채팅요청을 보내기 위한 함수(버튼 클릭시 실행)  
function send_videocamReq(socketID){
	socket.emit('videocam_req',session,socketID);
}

// 1_1_1 화상채팅요청을 받고 요청메시지를 생성
function recv_videocamReq(recv_session){
	var mgs_form = document.getElementById("videochat_msg");
	mgs_form.style.display = 'block';
	mgs_form.innerHTML = "<table border='0' cellpadding='0' cellspacing='0'>"+
		"<tr height='15px'><td></td></tr><tr height='61px'><td = width='16px'></td>"+
		"<td><img src='"+recv_session.photo+"' width='49px' height='49px'></td>"+
		"<td width='9px'></td><td><table border='0' cellpadding='0' cellspacing='0'>"+
		"<tr><td><b>"+recv_session.name+"</b></td></tr>"+
		"<tr height='10px'><td></td></tr><tr><td><b>화상채팅요청</b></td></tr>"+
		"<tr height='10px'><td></td></tr>"+
		"<tr><td>"+
		"<img src='/images/btn_accept.jpg' onclick=\"videocamReqAccept('"+recv_session.socketID+
		"')\">&nbsp;&nbsp;<img src='/images/btn_refuse.jpg' onclick=\"videocamReqRepuse('"+recv_session.socketID+
		"')\">"+
		"</td></tr></table></td></tr></table>"
				
}

// 1_1_2 화상채팅요청을 받고 1분안에
//       수락 및 거절 버튼을 누르지 않으면 거절 메시지를 보냄 
function request_timer(socketID){
	grant_request_timer = window.setTimeout(function(){
			var mgs_form = document.getElementById("videochat_msg");
			mgs_form.style.display = 'none';
			videocamReqRepuse(socketID);
	},60000);
}

// 1_1_3. 1_1_1에서 생성된 요청메시지에서 요청수락버튼을 위한 함수
//        처음 접속할 시, 카메라, 오디오 사용 메시지에서 허용을 누르지않으면
//        1_1_2에서 생성된 타이머 함수가 clear되지 않고,
//        요청수락메시지가 서버로 가지 않음.
function videocamReqAccept(socketID){
	clearTimeout(grant_request_timer);
	var a = document.getElementById("videochat_msg");
	a.style.display = 'none';
	
	if(!isRunRTC){
		remote_queue_init();
		my_video_init();
		console.log("req a start");
		timer = setInterval(function(){
			if(browser=="Chrome"){
				console.log('session - '+session.socketID);
				if(sourcevid.src.length!=0){
					socket.emit('videocam_res',session,socketID,true);		
					isRunRTC = true;
					clearInterval(timer);
					console.log("req c end");
				}
			}else if(browser=="Firefox"){
				//alert("aaa" + sourcevid.mozSrcObject);
				if(sourcevid.mozSrcObject!=null){
					socket.emit('videocam_res',session,socketID,true);		
					isRunRTC = true;
					clearInterval(timer);
					console.log("req f end");
				}	
			}
			
		},400);
	}else{
		socket.emit('videocam_res',session,socketID,true);		
	}
}

// 1_1_4. 1_1_1에서 생성된 요청메시지에서 요청거절버튼을 위한 함수
//        요청거절메시지를 보냄
function videocamReqRepuse(socketID){
	var a = document.getElementById("videochat_msg");
	a.style.display = 'none';
	socket.emit('videocam_res',session,socketID,false);
}


// 1_2_1. 상대방이 요청수락 시, 자신이 화상채팅 중 아니면 방생성 메시지
//        화상채팅 중이면 상대방에 방 입장 요청 메시지를 보내고(방이름과 함께)
//        방에 입장된 접속자에게 새 접속자 접속에 대한 메시지를 보냄
function send_request_joinRoom(recv_session){
	if(room_name==null){
		room_name = session.socketID;
		socket.emit('create_room',session,recv_session.socketID);
	}else{
		socket.emit('request_join_room',session,recv_session.socketID,room_name);
		socket.emit('peer_connect',recv_session.socketID);
	}
	
}
// 1_2_2. 상대방이 요청거절 시- 거절메시지
function refuseMessage(senderSession){
	alert("상대방에 거절하였습니다.");
}


//1_5.1 상대편의 방 입장완료 메시지를 받고,
//      상대편이 각 피어들의 RTC 연결을 위해서
//      자신이 관리하고 있는 리스트, 자신의 세션을 보냄.
//		자신은 상대편의 세션을 추가
function send_conn_list(recv_session,list){
	socket.emit('send_connlist',session,recv_session.socketID,connectPeerSession);	
	peerCount++;
	connectPeerSession.push(recv_session);
	remotevid_form.push(remotevid_form_queue.shift());
}

// 상대편의 영상을 띄울 비디오 엘리먼트들을 초기화
function remote_queue_init(){
	remotevid[0] = document.getElementById('remotevideo1');
	remotevid[1] = document.getElementById('remotevideo2');
	remotevid[2] = document.getElementById('remotevideo3');
	remotevid[3] = document.getElementById('remotevideo4');
	remotevid_form_queue[0] = 'video_chat_draggable2';
	remotevid_form_queue[1] = 'video_chat_draggable3';
	remotevid_form_queue[2] = 'video_chat_draggable4';
	remotevid_form_queue[3] = 'video_chat_draggable5';

	for(var i=0; i<4; i++){
		started[i] = false;
		document.getElementById(remotevid_form_queue[i]).style.display = 'none';
	}
}

// 자신의 비디오,오디오 자원을 받음(초기화)
function my_video_init(){
	sourcevid = document.getElementById('sourcevideo');
	document.getElementById('video_chat_id1').innerHTML = session.name;
	if(browser=="Chrome"){
		console.log("video init chrome");
		navigator.webkitGetUserMedia({video: true, audio: true}, function(stream){
			localStream = stream;
			sourcevid.src = window.URL.createObjectURL(stream);
			sourcevid.play();	
		}, errorCallback);
	} else if (browser=="Firefox"){
		console.log("video init Firefox");
		navigator.mozGetUserMedia({video: true, audio: true}, function(stream){
			localStream = stream;
			sourcevid.mozSrcObject = stream;
			sourcevid.play();
		}, errorCallback);
	}
	function errorCallback(error) {
			return;
	}
}

//1_6_1 상대편에게 접속자 리스트를 받고 각 접속자들과 연결.
function connect_start(){
	
		document.getElementById('video_chat_draggable1').style.display = 'block';
		document.getElementById('video_chat_draggable6').style.display = 'block';
		document.getElementById('video_chat_draggable_pannel').style.display = 'block';
		
		console.log("connectInterval length" + connectPeerSession.length);
		for(var i=0; i<connectPeerSession.length; i++){
			remotevid.push(remotevid_queue.shift());
			remotevid_form.push(remotevid_form_queue.shift());
			document.getElementById(remotevid_form[i]).style.display = 'block';
			if (!started[i] && localStream) {
				createPeerConnection(i);
				started[i] = true;
				createOffer(i);
			} else {
				alert("로컬스트림이 실행되지 않습니다. 다시 실행하시오");
			}
		}
}


//1_6_1_1 접속자와 P2P연결을 위해 offer 메시지를 보냄.(SDP프로토콜)
function createOffer(i){
	console.log("createOffer - session : " + session);
	console.log("createOffer - session : " + connectPeerSession[i]);
	console.log("index - " + i);
	if(browser=="Chrome"){
		peerConn[i].createOffer(function(sessionDescription){
			var sdpMsg = sessionDescription;
			sdpMsg.sdp = getInteropSDP(sdpMsg.sdp);
			peerConn[i].setLocalDescription(sdpMsg);
			socket.json.send({"type":sdpMsg.type,
					"sdp":sdpMsg.sdp,
					"sender":session,
					"receiver":connectPeerSession[i]});
		}, createOfferFailed, mediaConstraints);
	}else if(browser=="Firefox"){
		peerConn[i].createOffer(function(sessionDescription){
			var sdpMsg = sessionDescription;
			sdpMsg.sdp = getInteropSDP(sdpMsg.sdp);
			peerConn[i].setLocalDescription(sdpMsg);
			socket.json.send({"type":sdpMsg.type,
					"sdp":sdpMsg.sdp,
					"sender":session,
					"receiver":connectPeerSession[i]});
		}, createOfferFailed, mozmediaConstraints);	
	}
}

function createOfferFailed() {
	alert("offer메시지 생성에 실패하였습니다");
}
function getInteropSDP(sdp) {
    var inline = 'a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abc\r\nc=IN';
    sdp = sdp.indexOf('a=crypto') == -1 ? sdp.replace(/c=IN/g, inline) : sdp;
    return sdp;
}

function onChannelOpened(message) {
	console.log('Channel opened.');	
}


// 메시지를 받음.
function onMessage(evt) {
	var i = getConnectPeerIndex(evt.sender);		// 송신자에 대한 연결변수(peerConn)가 몇번째 인덱스에 있는지.
	console.log("type:" + evt.type +" index :" + i + " peer" + evt.sender + " recv : " + evt.receiver);
	// offer 메시지를 받을 때.
	if (evt.type === 'offer') {
		console.log("Received offer...");
		console.log("Sender : "+evt.sender);
		console.log("Receiver : "+evt.receiver);
		console.log("Index : "+i);
		console.log("started : " + started[i]);
		console.log("peerConn : " + peerConn[i]);
		if (!started[i]) {
			createPeerConnection(i);
			started[i] = true;
		}
		console.log('Creating remote session description...');
		//원격 디스크립션 설정
		peerConn[i].setRemoteDescription(new RTCSessionDescription(evt));
		console.log('Sending answer...');
		console.log("Received offer...");
		console.log("Sender : "+session);
		console.log("Receiver : "+evt.sender);
		console.log("Index : "+i);
		//answer메시지 생성
		if(browser=="Chrome"){
			peerConn[i].createAnswer(function (sessionDescription){
				var sdpMsg = sessionDescription;
				peerConn[i].setLocalDescription(sdpMsg);
				socket.json.send({"type":sdpMsg.type,
					"sdp":sdpMsg.sdp,
					"sender":session,
					"receiver":connectPeerSession[i]});
			},createAnswerFailed, mediaConstraints);
		}else if(browser=="Firefox"){
			peerConn[i].createAnswer(function (sessionDescription){
				var sdpMsg = sessionDescription;
				peerConn[i].setLocalDescription(sdpMsg);
				socket.json.send({"type":sdpMsg.type,
					"sdp":sdpMsg.sdp,
					"sender":session,
					"receiver":connectPeerSession[i]});
			}, createAnswerFailed, mozmediaConstraints);
			display_name(i);
		}
	// answer메시지를 받았을 때	
	} else if (evt.type === 'answer' && started[i]) {
		console.log('Received answer...');
		console.log("Sender : "+ evt.sender);
		console.log("Receiver : "+ evt.receiver);
		console.log("Index : "+ i);
		console.log('Setting remote session description...');
		//원격 디스크립션 설정
		peerConn[i].setRemoteDescription(new RTCSessionDescription(evt));
		display_name(i);
	// candidate메시지를 받았을 때
	} else if (evt.type === 'candidate' && started[i]) {
		console.log('Received ICE candidate...');
		var candidate = new RTCIceCandidate({
			sdpMLineIndex: evt.sdpMLineIndex,
			sdpMid: evt.sdpMid,
			candidate: evt.candidate,
			sender: session,
			receiver: evt.sender});
		// 상대방의 네트워크 정보를 등록
		peerConn[i].addIceCandidate(candidate);
	} 
}

function createAnswerFailed() {
	console.log("Create Answer failed");
}

function createPeerConnection(i) {
	console.log("Creating peer connection index " + i);
	var pc_config = {"iceServers": []};
	try {
		if(browser=="Chrome"){
			peerConn[i] = new RTCPeerConnection(pc_config,{optional: [{DtlsSrtpKeyAgreement: true}]});
		} else {
			peerConn[i] = new RTCPeerConnection(pc_config);
		}
	} catch (e) {
		console.log("Failed to create PeerConnection, exception: " + e.message);
	}

	// 다른 피어에 ice candidate 메시지를 보냄
	peerConn[i].onicecandidate = function(evt) {
		if (event.candidate) {
			console.log("candidate send");
			socket.json.send({type: "candidate",
				sdpMLineIndex: evt.candidate.sdpMLineIndex,
				sdpMid: evt.candidate.sdpMid,
				candidate: evt.candidate.candidate,
				sender: session,
				receiver: connectPeerSession[i]});
		} else {
			console.log("End of candidates.");
		}
	};
	// 로컬스트림을 rtc객체에 등록
	peerConn[i].addStream(localStream);
	peerConn[i].addEventListener("addstream",onRemoteStreamAdded, false);
	peerConn[i].addEventListener("removestream", onRemoteStreamRemoved, false);
	
	// 원격스트림 받고 비디오 엘리먼트에 넘김
	function onRemoteStreamAdded(event) {
		console.log('Peer ' + i + ' Added remote stream...');
		console.log("***************** peercon");
		if(browser=="Chrome"){
			remotevid[i].src = webkitURL.createObjectURL(event.stream);
		}else if(browser=="Firefox"){
			remotevid[i].mozSrcObject  = event.stream;			
		}
		remotevid_form.push(remotevid_form_queue.shift());
		document.getElementById(remotevid_form[i]).style.display = 'block';
	}
	// 원격스트림이 없어질 때 비디오 엘리먼트에서 제거
	function onRemoteStreamRemoved(event) {
		console.log('Peer ' + event.sender + ' Remove remote stream...');
		if(browser=="Chrome"){
			remotevid[i].src = "";
		}else if(browser=="Firefox"){
			remotevid[i].mozSrcObject  = "";		
		}
	}
}

// 접속자가 나갈 때에 대한 처리
function connectPeerSessionPop(idx){
	console.log("idx - "+idx+" con - "+remotevid_form[idx]);
	if(peerConn[idx]!=null)	peerConn[idx].close();
	remotevid[idx].src = "";
	var formname=remotevid_form[idx];
	document.getElementById(formname).style.display = 'none';
	remotevid_queue.push(remotevid[idx]);
	remotevid_form_queue.push(remotevid_form[idx]);
	
	if(idx==connectPeerSession.length){
		return;
	} else if(idx==connectPeerSession.length-1) {
		connectPeerSession.pop();
		remotevid_form.pop();
		started[idx] = false;
		peerConn[idx] = null;
	} else {
		var length = connectPeerSession.length;
		
		connectPeerSession[idx] = connectPeerSession.pop();
		remotevid[idx] = remotevid.pop();
		peerConn[idx] = peerConn[4];
		started[idx] = starte[4];
		peerConn[4] = false;
		started[4] = false;
	}
}
// 접속자가 몇번째 인덱스에 있는지.
function getConnectPeerIndex(data){
	
	for(var i=0; i<connectPeerSession.length; i++){
		console.log("list : " + connectPeerSession[i].socketID+" index : "+i);
		console.log("data : " + data);
		if(connectPeerSession[i].socketID === data.socketID){
			console.log(("꼭맞음"));
			return i;
		}
	}
}
// 접속자가 몇번째 인덱스에 있는지.
function getConnectSocketIndex(data){
	
	for(var i=0; i<connectPeerSession.length; i++){
		console.log("list : " + connectPeerSession[i].socketID+" index : "+i);
		console.log("data : " + data);
		if(connectPeerSession[i].socketID === data){
			console.log(("꼭맞음"));
			return i;
		}
	}
}
// 나갈때
function rtc_exit(){
		//socket.emit('disconnect_type', {type : true});
		location.reload();
		//socket.emit('disconnect_type', {type : true});
		/*
		if (!pageout && !link) {
			pageout = true;
			return "이 페이지에서 나가시겠습니까";
		}*/
	//location.reload();
	//socket.emit('disconnect_type', {type : true});
}
function display_canvas(){
	document.getElementById('canvas_draggable').style.display = 'block';
}
function display_photo(){
	document.getElementById('photo_form').style.display = 'block';
}
function display_name(i){
	document.getElementById('video_chat_id'+(i+2)).innerHTML = connectPeerSession[i].name;
}
function close_canvas(){
	document.getElementById('canvas_draggable').style.display = 'none';
}
function close_photo(){
	document.getElementById('photo_form').style.display = 'none';
}