/**********************************************************************

							Canvas Module

**********************************************************************/
// Canvas 객체를 추출합니다.
var canvas;
var context;

// 변수를 선언합니다.
var swidth;
var scolor;
var isDown;
var newPoint, oldPoint;

//point 생성자 함수를 생성
function Point(event, target) {
	this.x = event.pageX - $(target).position().left;
	this.y = event.pageY - $(target).position().top;
}

function canvas_start(){
	// Canvas 객체를 추출합니다.
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');

	// 변수를 선언합니다.
	swidth = 5;
	scolor = '#000000';
	isDown = false;


	 // 이벤트를 연결합니다.
	canvas.onmousedown = function (event) {
		isDown = true;
		oldPoint = new Point(event, this);
	};
	canvas.onmouseup = function () { isDown = false; };
	canvas.onmousemove = function (event) {
		if (isDown) {
			newPoint = new Point(event, this);
			var t = parseInt(document.getElementById('canvas_draggable').style.top);
			var l = parseInt(document.getElementById('canvas_draggable').style.left);
			socket.emit('draw', {
				width: swidth,
				color: scolor,
				x1: oldPoint.x,
				y1: oldPoint.y,
				x2: newPoint.x,
				y2: newPoint.y,
				t: t,
				l: l
			});

			oldPoint = newPoint;
		}
	};

	// 소켓 이벤트를 연결합니다.
	socket.on('line', function (data) {
		context.lineWidth = data.width;
		context.strokeStyle = data.color;
		context.beginPath();
		context.moveTo(data.x1-data.l, data.y1-data.t);
		context.lineTo(data.x2-data.l, data.y2-data.t);
		context.stroke();
	});

	// UI를 구성합니다.
	$('#colorpicker').farbtastic(function(data) {
		scolor = data;
		$('#kkk').value=data.value;
	});

	$('#slider').slider({
		max: 20, min: 1, value: 5, change: function (event, ui) {
			swidth = ui.value;
		}
	});
}