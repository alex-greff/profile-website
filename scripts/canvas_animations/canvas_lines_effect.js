var CANVAS_LINE_EFFECT_CANVAS_NAME = "";
var GRADIENT_GRANULARITY = 20;
var LINE_OPACITY_DIVISOR = 1;

class Line {
	/*
	period: the period of one cycle (seconds)
	delay: the delay of the line (seconds) and therefore offset
	(start_pos_X, start_pos_Y): the start position (percent of canvas)
	(end_pos_X, end_pos_Y): the end position (percent of canvas)
	*/
	constructor (period, delay, width, start_pos_X, start_pos_Y, end_pos_X, end_pos_Y) {
		this.period = period;
		this.delay = delay;
		this.width = width;
		this.start_pos = [];
		this.start_pos[0] = start_pos_X;
		this.start_pos[1] = start_pos_Y;
		this.end_pos = [];
		this.end_pos[0] = end_pos_X;
		this.end_pos[1] = end_pos_Y;

		this.curr_start_pos = [];
		this.curr_end_pos = [];

		var time = new Date();
		this.initialize_time = time.getTime();
		this.start_time = -1;
	}
}

var lines = [];

function init_lines() {
	var l = [];
	const period = 7;
	const line_width = 5;
	const base_delay = 6;

	// period, delay, width, start_pos_X, start_pos_Y, end_pos_X, end_pos_Y
	l[0] = new Line(period, base_delay + 0, line_width, 0, 10, 100, 75);
	l[1] = new Line(period, base_delay + 0, line_width, 0, 70, 100, 45);
	l[2] = new Line(period, base_delay + 0, line_width, 10, 100, 30, 0);
	l[3] = new Line(period, base_delay + period*1/3, line_width, 100, 50, 60, 100);
	l[4] = new Line(period, base_delay + period*1/3, line_width, 40, 0, 75, 100);
	l[5] = new Line(period, base_delay + period*1/3, line_width, 20, 0, 100, 75);
	l[6] = new Line(period, base_delay + period*2/3, line_width, 0, 70, 80, 100);
	l[7] = new Line(period, base_delay + period*2/3, line_width, 40, 0, 10, 100);
	l[8] = new Line(period, base_delay + period*2/3, line_width, 40, 100, 30, 0);

	return l;
}

function run_canvas_line_effect(canvas_name) {
	CANVAS_LINE_EFFECT_CANVAS_NAME = canvas_name;

	lines = init_lines();

	window.requestAnimationFrame(draw_canvas_lines_effect);
}

function draw_canvas_lines_effect() {
	var scroll_top = window.pageYOffset // get number of pixels document has scrolled vertically 

	var canvas = document.getElementById(CANVAS_LINE_EFFECT_CANVAS_NAME);
	var ctx = canvas.getContext("2d");

	ctx.globalCompositeOperation = 'destination-over';
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var time = new Date();

	for (var i = 0; i < lines.length; i++) {
		var real_time = time.getTime();
		var line = lines[i];

		if (real_time - line.initialize_time < line.delay*1000) {
			continue;
		}

		if (line.start_time < 0) {
			line.start_time = real_time;
		}

		var delta_t = real_time - line.start_time;

		//var t = (time.getTime()/500*Math.PI)*(1/line.period) + line.offset/50*Math.PI;
		var t = (delta_t/500*Math.PI)*(1/line.period) + 1.65*Math.PI;

		var curr_line_anim_cruve_points = [];

		for (var j = 0; j < GRADIENT_GRANULARITY; j++) {
			var x = (t + j/(GRADIENT_GRANULARITY-1));			
			var boundary = x % Math.PI;
			var curve = 0;
	
			if (boundary < Math.PI) {
				curve = Math.sin(x);
			}

			curr_line_anim_cruve_points[j] =  curve;
		}

		var start_pos = [];
		start_pos[0] = getPosX(line.start_pos[0]);
		start_pos[1] = getPosY(line.start_pos[1]);

		var end_pos = [];
		end_pos[0] = getPosX(line.end_pos[0]);
		end_pos[1] = getPosY(line.end_pos[1]);

		// Line
		var curr_line_grad = ctx.createLinearGradient(start_pos[0], start_pos[1], end_pos[0], end_pos[1]);
		for (var j = 0; j < GRADIENT_GRANULARITY; j++) { 
			curr_line_grad.addColorStop(j/GRADIENT_GRANULARITY, "rgba(0, 38, 58, " + curr_line_anim_cruve_points[j]/LINE_OPACITY_DIVISOR + ")");
		}

		ctx.beginPath();
		ctx.strokeStyle = curr_line_grad;
		ctx.moveTo(start_pos[0], start_pos[1]);
		ctx.lineTo(end_pos[0], end_pos[1]);
		ctx.lineWidth = line.width;
		ctx.stroke();
	}

	window.requestAnimationFrame(draw_canvas_lines_effect);
}

function getPosX(width_percent) {
	var canvas = document.getElementById(CANVAS_LINE_EFFECT_CANVAS_NAME);
	var canvas_width = canvas.width;
	
	return canvas_width * (width_percent/100);
}

function getPosY(height_percent) {
	var canvas = document.getElementById(CANVAS_LINE_EFFECT_CANVAS_NAME);
	var canvas_height = canvas.height;

	return canvas_height * (height_percent/100);
}