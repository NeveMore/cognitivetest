window.onload = function() {
	paper.setup('myCanvas');
	with (paper) {
		var path = new Path();
		path.strokeColor = 'black';
		var start = new Point(100, 100);
		path.moveTo(start);
		path.lineTo(start.add([ 200, -50 ]));
		view.draw();
	}
}