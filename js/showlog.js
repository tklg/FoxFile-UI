function debugObject(type, content, delay) {
	this.type = type;
	this.content = content;
	this.delay = delay;
}
function debugObject(type, content) {
	this.type = type;
	this.content = content;
}
function debugObject(content) {
	this.content = content;
}

var d = {
	errNum: 0,
	error: function(msg) {
		d.errNum++;
		if (msg == null) msg="undef";
		$('.alertbox').append('<p class="alert-item alert-error" id="alert-' + d.errNum + '">' + msg + '</p>');
		var debO = new debugObject('error', msg);
		d.show(d.errNum, 5000);
	},
	warning: function(msg) {
		d.errNum++;
		if (msg == null) msg="undef";
		$('.alertbox').append('<p class="alert-item alert-warning" id="alert-' + d.errNum + '">' + msg + '</p>');
		d.show(d.errNum, 5000);
	},
	info: function(msg) {
		d.errNum++;
		if (msg == null) msg="undef";
		$('.alertbox').append('<p class="alert-item alert-info" id="alert-' + d.errNum + '">' + msg + '</p>');
		d.show(d.errNum, 5000);
	},
	success: function(msg) {
		d.errNum++;
		if (msg == null) msg="undef";
		$('.alertbox').append('<p class="alert-item alert-success" id="alert-' + d.errNum + '">' + msg + '</p>');
		d.show(d.errNum, 5000);
	},
	show: function(s, t) {
		if (!(t > 0)) {
			$('#alert-' + s).fadeIn();
		} else {
			$('#alert-' + s).fadeIn();
			setTimeout(function() {
				d.hide(s, true);
			}, t);
		}
	},
	hide: function(s, r) {
		$('#alert-' + s).fadeOut();
		if (r) {
			setTimeout(function(){
				d.remove(s);
			}, 1000);
		}
	},
	remove: function(s) {
		$('#alert-' + s).remove();
	}
}
