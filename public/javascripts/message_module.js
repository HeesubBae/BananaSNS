// JavaScript Document
function chat_start(){
	socket.on('recv_chat', function(session,socketID,data){
		openMessageBoxState(socketID,session.name);
		display_chat(socketID,data);
	});
	socket.on('recv_my_chat', function(socketID,data){
		display_my_chat(socketID,data);
	});
}
function openMessageBoxState(socketID,name){
	try{
		document.getElementById('chat_'+socketID).style.display='block';
	} catch (e) {
		createMessageBox(socketID,name);
	}
}
function createMessageBox(socketID,name){
	document.getElementById('wrap').innerHTML += '<div id="chat_'+socketID+'" class="chat_draggable_wrap">'+
												'<div class="chat_draggable_status_Bar">'+
												'<span>'+name+'</span>'+
												'<span><a href="javascript:;" onclick="messagebox_close('+"'"+socketID+"'"+');">'+
												'<img src="/images/chat_close.png"></a>'+
												'</div>'+'<div class="room_chat_pannel">'+
												'<div class="scroll_div_room_chat">'+
												'<ul id="chat_display'+socketID+'">'+
												'</ul></div></div>'+
												'<div class="room_chat_input_pannel">'+
												'<input type="text" id="chat_input'+socketID+'"'+
												'name="room_chat_input" class="room_chat_input" onKeyPress="send_message('+"'"+socketID+"'"+')">'+
												'</div></div>';
	$( "#chat_"+socketID ).draggable({ snap: true });
	$(".scroll_div_room_chat").mCustomScrollbar({
		advanced:{
			updateOnContentResize:true
		}
	});
}
function send_message(socketID){
	if(event.keyCode != 13) return false;
	socket.emit('input_chat',socketID,session,document.getElementById("chat_input"+socketID).value);
	$("#chat_input"+socketID).val("");
	
}


function display_chat(socketID,data){
	document.getElementById('chat_display'+socketID).innerHTML+='<li><div class="room_chat_content_pannel">'+
		'<div class="room_chat_photo">'+'<img src="/images/photo.jpg" width="20px" height="20px"></div>'+
		'<span class="room_chat_content">'+'<div class="chat_content_top"></div>'+
		'<span class="room_chat_text">'+data+'</span>'+
        '<div class="chat_content_bottom"></div></span></div></li>';
		$(".scroll_div_room_chat").mCustomScrollbar("scrollTo","bottom",{
				scrollInertia : 10 
		});
}	

function display_my_chat(socketID,data){
	document.getElementById('chat_display'+socketID).innerHTML+='<li><span class="room_chat_content_pannel">'+
	'<span class="room_mychat_content">'+
    	'<div class="chat_mycontent_top"></div>'+
        '<span class="room_chat_text">'+data+'</span>'+
        '<div class="chat_mycontent_bottom"></div></span><div class="room_mychat_photo">'+
		'<img src="/images/photo.jpg" width="20px" height="20px"></div></span></li>';
		
		$(".scroll_div_room_chat").mCustomScrollbar("scrollTo","bottom",{
				scrollInertia : 10 
		});
}
function messagebox_close(socketID){
	document.getElementById('chat_'+socketID).style.display = "none";
}