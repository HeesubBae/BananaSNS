var filename='';
function file_upload(){																						
	var timerId;
	timerId = setInterval(function() {
		if($('#userPhotoInput').val() !== filename) {
			//clearInterval(timerId);
			filename = $('#userPhotoInput').val();
			$('#uploadForm').submit();
			
		}
	}, 500);
	$('#uploadForm').submit(function() {
 		$(this).ajaxSubmit(
			{																												 			error: function(xhr) {
				alert("�̹����� ���ε��ϴµ� �����Ͽ����ϴ�.");
			},
 			success: function(response) {
 				if(response.error) {
					alert("�̹����� ���ε��ϴµ� �����Ͽ����ϴ�.");
					return;
				}
				socket.emit('photo_upload',response.path);
			}
		});
		return false;
	});
	socket.on('photo_upload',function(path){
		document.getElementById('uploadImage').src = path;
	});
}
function cover_bg_change(){
	
	$('#cover_change').submit(function() {
		console.log("ssss");
		$(this).ajaxSubmit({																												 			error: function(xhr) {
				alert("aaaaaaaaaaaa");
			},
 			success: function(response) {
 				if(response.error) {
					alert("bbbbbb");
					return;
				}
				//alert(response.path);
				var id = $("#topset_mypage").attr('value');
				mypage_init(id);

			}
		});
		return false;
	});

}
function cover_bg_change_submit(){
	
	if($('#cover_change_id').val() !== '') {
			$('#cover_change').submit();
	} else {
		alert("���ε� �� ������ �����Ͻʽÿ�");
	}
}

function profile_bg_change(){
	
	$('#profile_change').submit(function() {
		console.log("ssss");
		$(this).ajaxSubmit({																												 			error: function(xhr) {
				alert("aaaaaaaaaaaa");
			},
 			success: function(response) {
 				if(response.error) {
					alert("bbbbbb");
					return;
				}
				//alert(response.path);
				var id = $("#topset_mypage").attr('value');
				mypage_init(id);

				$('#mypage_profile_photo_edit').attr('style',"background-image:url("+response.path+")"); //Ŀ�������� �޹��
				document.getElementById('mypage_profile_photo').innerHTML="<img src='"+response.path+"/>";
				//document.getElementById('mypage_cover_wrap').style.backgroundImage=response.path;
				//$("#mypage_cover_wrap").attr('style','backgroundImage');
			}
		});
		return false;
	});

}
function profile_bg_change_submit(){
	
	if($('#profile_change_id').val() !== '') {
			$('#profile_change').submit();
	} else {
		alert("���ε� �� ������ �����Ͻʽÿ�");
	}
}