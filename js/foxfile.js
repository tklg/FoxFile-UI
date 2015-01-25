var winHeight = $(window).height();
var winWidth = $(window).width();
var res;

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
		/*$('.bar#bar-main').css({
			'width': '25%'
		});
		$('.bar#bar-orig').css({
			'width': '75%',
			'margin-left': '25%'
		});*/
		var title = {
			fontSize: 20,
			fontSpacing: 5,
			fontTotalWidth: $('.title').width(),
			fontLetterWidth: $('.title').width() / $('.title').text().length
		}
		var width = {
			titleBox: $('.title').width(),
			titleText: title.fontTotalWidth,
			titleLetterSpacing: $('.title').width() / (($('.title').text().length - 1) * 4.8)
		}
		$('.menubar-title').css({
			'font-size': title.fontLetterWidth + 'pt',
			'letter-spacing': width.titleLetterSpacing + 'pt'
		})
		console.log("Title box width: " + width.titleBox);
		console.log("Title font size: " + title.fontLetterWidth);
		console.log("Title font length: " + $('.title').text().length);
		console.log("Set title spacing to " + width.titleLetterSpacing);
	}
}

function resizeAll() {
	//getActivePanes();
	init.resize(); //temporary
}

function showFileTypeIcons() {
	//resize all file icon boxes to be squares
	//49px tall
	$('.file-type-icon').css({
		'max-height': 49 + 'px',
		'max-width': 49 + 'px',
		'top': 40 + 'px',
		'left': 25 + '%'
	})
}