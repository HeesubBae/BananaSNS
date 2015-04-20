/*************************************************************************
							화상채팅_단체채팅
*************************************************************************/
function room_chat_start(){
	//room_chat_init();
	socket.on('recv_room_chat', function(recv_session,data){
		display_room_chat(recv_session,data);
	});
	socket.on('recv_my_room_chat', function(data){
		display_my_room_chat(data);
	});
}
function room_chat_init(){
	document.getElementById('room_chat_display').innerHTML='';
}
function display_room_chat(recv_session,data){
	document.getElementById('room_chat_display').innerHTML+='<li><span class="room_chat_content_pannel">'+
		'<div class="room_chat_photo">'+'<img src="/images/photo.jpg" width="20px" height="20px"></div>'+
		'<span class="room_chat_content">'+'<div class="chat_content_top"></div>'+
		'<span class="room_chat_text">'+data+'</span>'+
        '<div class="chat_content_bottom"></div></span></span></li>'
	$(".scroll_div_room_chat").mCustomScrollbar("scrollTo","bottom",{
				scrollInertia : 10 
		});
}	

function display_my_room_chat(data){
	document.getElementById('room_chat_display').innerHTML+='<li><span class="room_chat_content_pannel">'+
	'<span class="room_mychat_content">'+
    	'<div class="chat_mycontent_top"></div>'+
        '<span class="room_chat_text">'+data+'</span>'+
        '<div class="chat_mycontent_bottom"></div></span><div class="room_mychat_photo">'+
		'<img src="/images/photo.jpg" width="20px" height="20px"></div></span></li>';
		
		$(".scroll_div_room_chat").mCustomScrollbar("scrollTo","bottom",{
				scrollInertia : 10 
		});
}	
function send_room_chat(){
	if(event.keyCode != 13) return false;
	
	
	socket.emit('room_chat',session,document.getElementById('room_chat_input').value);
	$("#room_chat_input").val("");
}