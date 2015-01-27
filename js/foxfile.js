/*
 * foxfile.js - FoxFile
 * (C) Theodore Kluge 2014-2015
 * villa7.github.io
*/
//any from_url variable is not needed and is just for testing with static json files

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
	},
	loadFiles: function() {
		BCL = new BarContentLoader();
		BCL.start('backbonetest.json', 2, 'file_key', 'parent_key');
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
	currentOffset: 0,
	add: function(title, moveBack, type) {
		bar.active++;
		$('#wrapper').append('<section class="bar bar-vertical" id="bar-' + this.active + '" type="' + type + '" state="closed"> <div class="menubar-title">' + title + '</div> <div class="menubar menubar-left"> <ul> </ul> </div> </section>');
		bar.size(this.active - 1, 1);
		if (this.active <= this.maxActive) {
			bar.move(this.active, this.active);
			switch(this.active) {
				case 4: size = 2; break; 
				case 5: size = 1; break;  
				default: size = 2; break;
			}
			bar.size(this.active, size);
		} else  {
			if (moveBack) {
				this.currentOffset--;
				for (i = 1; i <= this.active; i++) {
					bar.moveLeft(i);
					//console.log("moving bar " + i + " to " + (i + this.currentOffset));
				}
			}
			console.log("--");
			bar.move(this.active, this.maxActive);
			bar.size(this.active, 1);
		}
		d.info("active: " + this.active);
		resizeAll();
	},
	fill: function(from_url, bar, file_key, parent_key) {
		BCL = new BarContentLoader();
		BCL.start(from_url, bar, file_key, parent_key);
	},
	clear: function(bar) {
		$('#bar-' + bar + ' ul').empty();
	},
	remove: function(bar) {
		this.active--;
		$('#bar-' + bar).remove();

	},
	setActive: function(bar) {
		//this.active = bar;
		$('.bar').attr('active', false);
		$('#bar-' + bar).attr('active', true);
		d.info("Set bar " + bar + " to active");
	},
	size: function(bar, size) {
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
		var lpos;
		switch(pos) {
			case 1: lpos = 0; break; 
			case 2: lpos = 25; break; 
			case 3: lpos = 50; break; 
			case 4: lpos = 75; break; 
			case 0: lpos = -25; break; 
			case -1: lpos = -50; break; 
			case -2: lpos = -75; break; 
			case -3: lpos = -100; break; 
			default: lpos = -100; break;
		}
		$('#bar-' + bar).css({
			'left': lpos + "%"
		});
		$('#bar-' + bar).attr("pos", pos);
	},
	moveLeft: function(bar) {
		var barpos = parseInt($('#bar-' + bar).attr("pos"));
		//if (barpos > 0) {
			console.log("moving bar " + bar + " left");
			this.move(bar, barpos - 1);
		//}
	},
	moveRight: function(bar) {
		var barpos = parseInt($('#bar-' + bar).attr("pos"));
		//if (barpos < bar.maxActive) {
			console.log("moving bar " + bar + " right");
			this.move(bar, barpos + 1);
		//}
	},
	updatePos: function(bar) {
		$('#bar-' + bar).attr("pos", bar);
	}
}
//to set the pos attribute on the original 2 bars
bar.updatePos(1);
bar.updatePos(2);
var files = {
			open: function (from_url, hash, title, bar_id) {
				console.log("clicked on file in bar " + bar_id);
				console.log("from_url: " + from_url);
				console.log("hash: " + hash);
				console.log("title: " + title);
				if (bar_id == bar.active) { //user clicked on the active bar, make a new one to the right
					console.log("Clicked on active bar");
					bar.add(title, true);
					bar.fill(from_url, bar.active, hash);
					bar.setActive(bar.active);
				} else { //user clicked on a bar back in the stack, remove all after it and remake the needed folder/file
					console.log("Clicked on inactive bar");
					var diff = bar.active - bar_id;
					console.log("difference: " + diff);
					if (bar.active > bar.maxActive && diff != 1) {
						for (i = 1; i <= bar.active; i++) {
							bar.moveRight(i);
							console.log("Moved bar " + i + " right");
						}
					}
					for (i = 0; i < diff; i++) {
						console.log("removing active bar: " + bar.active);
						bar.remove(bar.active);
					}
					bar.add(title, false);
					bar.fill(from_url, bar.active, hash);
					bar.setActive(bar.active);
				}
				if (bar_id == 1) {
					bar.size(2, 3);
				}
			}
		}

function getExt(filename) {
	var a = filename.split(".");
	if( a.length === 1 || ( a[0] === "" && a.length === 2 ) ) {
	    return "";
	}
	return a.pop();
}

var BarContentModel = Backbone.Model.extend({
	defaults: {
		fileName: '',
		fileSize: 0,
		fileType: '',
		basicFileType: '',
		fileID: 0,
		hash_self: '',
		hash_child: '',
		hash_parent: '',
		onclick: '',
		container: ''
	}
});

var BarContentList = Backbone.Collection.extend({
	parent_key: '',
	file_key: '',
	model: BarContentModel,
	//url: 'dbquery.php?parent=' + this.parent_key + '&key=' + this.file_key
	url: ''
});
var BCL, BCV;

var BarContentView = Backbone.View.extend({
	barID: '',
	barTemplate: _.template($('#bar_template').html()),
	initialize: function() {
		//console.log('BarContentView initialized');
		this.collection.on('reset', this.render, this);
		c = this.collection;
		//fade in loading spinny
		this.collection.fetch({
			success: function(model, response) {
				//console.info("Loaded model");
				var files = response['file'];
				//console.log(files[0].name);
				var arr = [];
				for (var i = 0; i < files.length; i++) {
					obj = {
						'fileName': files[i].name,
						'fileType': files[i].type,
						'basicFileType': '',
						'fileSize': files[i].size,
						'fileID': files[i].id,
						'hash_self': files[i].hash_self,
						'hash_child': files[i].hash_child,
						'hash_parent': files[i].hash_parent,
						'onclick': 'files.open(\'' + BCL.url + '\', \'' + files[i].hash_self + '\', $(this).attr(\'name\'), $(this).attr(\'container\'));$(this).attr(\'state\', \'open\');',
						'container': BCV.barID
					};
					if (obj.fileType.toLowerCase() == 'folder') {
						obj.basicFileType = 'folder';
					} else {
						switch (getExt(obj.fileName)) {
							case 'txt': case 'log': case 'rtf': case 'js': case 'java': case 'c': case 'cs': case 'cpp': case 'lua': case 'md': case 'css': case 'html': case 'htm': case 'php': case 'json':
								obj.basicFileType = 'text'
								break;
							case 'dat': case 'xml':
							obj.basicFileType = 'data'
								break;
							case 'aif': case 'm4a': case 'mid': case 'mp3': case 'mpa': case 'wav': case 'wma':
							obj.basicFileType = 'audio'
								break;
							case 'avi': case 'm4v': case 'mov': case 'mp4': case 'mpg': case 'wmv':
							obj.basicFileType = 'video'
								break;
							case 'bmp': case 'jpg': case 'png': case 'psd': case 'tga': case 'gif': case 'svg': case 'ai':
							obj.basicFileType = 'image'
								break;
							case 'zip': case 'gz': case 'rar': case 'pkg': case '7z':
							obj.basicFileType = 'zip'
								break;
						}
					}

					arr.push(obj);
					//console.log(obj);
				}
				//fade out loading spinny
				c.reset(arr);
			},
			error: function() {

			}
		});
	},
	render: function() {
		this.collection.each(this.list, this);
	},
	list: function(model) {
		//console.log("Appending template to #bar-" + this.barID);
		$('#bar-' + this.barID + ' .menubar ul').append(this.barTemplate({model: model}));
	}
});
var BarContentLoader = Backbone.Router.extend({
	routes: {
		'': 'start'
	},
	start: function(src_url, target_element, file_key, parent_key) {
		//console.log("BarcontentLoader");
		BCL = null;
		BCV = null;
		BCL = new BarContentList();
		BCL.parent_key = parent_key;
		BCL.file_key = file_key;
		BCL.url = src_url;
		BCV = new BarContentView({
			collection: BCL
		});
		BCV.barID = target_element;
	}
})

init.loadFiles();
