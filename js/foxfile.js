/*
 * foxfile.js - FoxFile
 * (C) Theodore Kluge 2014-2015
 * villa7.github.io
*/

var winHeight = $(window).height();
var winWidth = $(window).width();
var res;
var total_bars = 2;

$(window).resize(function() {
	clearTimeout(res);
	res = setTimeout(function() {
    winHeight = $(window).height();
    winWidth = $(window).width();
    resizeAll();
    console.log('resized');
	}, 100);
});

var init = {
	resize: function() {
		var title = {
			fontSize: 20,
			fontSpacing: 5,
			fontTotalWidth: $('.title').width(),
			fontLetterWidth: $('.title').width() / $('.title').text().length
		}
		var width = {
			titleBox: $('.title').width(),
			titleText: title.fontTotalWidth,
			titleLetterSpacing: $('.title').width() / (($('.title').text().length - 1) * 4.2)
		}
		$('.title, .menubar-title').css({
			'font-size': title.fontLetterWidth + 'pt',
			'letter-spacing': width.titleLetterSpacing + 'pt'
		})
		// console.log("Title box width: " + width.titleBox);
		// console.log("Title font size: " + title.fontLetterWidth);
		// console.log("Title font length: " + $('.title').text().length);
		// console.log("Set title spacing to " + width.titleLetterSpacing);
	}
}

function resizeAll() {
	//var width = getDispWidth();
	//var bar = getActiveBar();
	init.resize(); //temporary
}

var bar = {
	active: 2,
	maxActive: 4,
	add: function() {
		bar.active++;
		//backbone add template of menubar
	},
	fill: function(bar) {
		//var content = getContent(bar);
		//backbone add template of menubar-item, append to bar
	},
	getContent: function(bar) {
		//ajax post request to server to find files in folder hash
		//return files as array?
	},
	setActive: function(bar) {
		this.active = bar;
		$('.bar').attr('active', false);
		$('#bar-' + bar).attr('active', true);
		d.info("Set bar " + bar + " to active");
	},
	changeSize: function(bar, size) {
		//change bar to size where size = percent
		switch(size) {
			case 1: size = 25; break; 
			case 2: size = 50; break; 
			case 3: size = 75; break; 
			case 4: size = 100; break;  
			default: size = 25; break;
			}
		$('#bar-' + bar).css({
			'width': size + "%"
		})
	},
	move: function(bar, pos) {
		//move bar to position from left where pos = screen width / 1 or 2 or 3 or 4 or -1 or -2
		//pos 1 = first bar on left, 2 = second, etc
		switch(pos) {
			case 1: pos = 0; break; 
			case 2: pos = 25; break; 
			case 3: pos = 50; break; 
			case 4: pos = 75; break; 
			case -1: pos = -25; break; 
			case -2: pos = -50; break; 
			case -3: pos = -75; break; 
			case -4: pos = -100; break; 
			default: pos = 0; break;
		}
		$('#bar-' + bar).css({
			'left': pos + "%"
		})
	}
}