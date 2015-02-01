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

function resizeAll() {
	init.resize(); //temporary
}

var bar = {
	active: 2,
	maxActive: 3,
	currentOffset: 0,
	add: function(title, moveBack, type, onclick) {
		bar.active++;
		$('#wrapper').append('<section class="bar bar-vertical" id="bar-' + this.active + '" type="' + type + '" state="closed"> <div class="menubar-title"><span class="heightsettertext"></span><i class="bar-backbutton btn fa fa-caret-left"></i><span class="menubar-title-link btn" onclick="' + onclick + '">' + title + '</div> <div class="menubar menubar-left"> <ul> </ul> </div> </section>');
		bar.move(this.active, 5);
		bar.size(this.active - 1, 1);
		if (this.active <= this.maxActive) {
			bar.move(this.active, this.active);
			switch(this.active) {
				case 4: size = 2; break; 
				case 5: size = 2; break;  
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
			bar.size(this.active, 2);
		}
		//d.info("active: " + this.active);
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
		//d.info("Set bar " + bar + " to active");
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
			case 5: lpos = 100; break;
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
	},
	home: function() {
		for (i = 2; i < this.active; i++) {
			bar.remove(i);
		}
		this.move(1, 1);
		this.move(2, 2);
		this.size(1, 1);
		this.size(2, 3);
	}
}
//to set the pos attribute on the original 2 bars
bar.updatePos(1);
bar.updatePos(2);
var files = {
			open: function (from_url, hash, title, bar_id, type, onclick) {
				console.log("clicked on file in bar " + bar_id);
				console.log("from_url: " + from_url);
				console.log("hash: " + hash);
				console.log("title: " + title);
				if (bar_id == bar.active) { //user clicked on the active bar, make a new one to the right
					console.log("Clicked on active bar");
					bar.add(title, true, type, onclick);
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
					bar.add(title, false, type, onclick);
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
var barTypeToMake;

var BarContentView = Backbone.View.extend({
	barID: '',
	folderTemplate: _.template($('#folder_template').html()),
	fileTemplate: _.template($('#file_template').html()),
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
						'onclick': 'files.open(\'' + BCL.url + '\', \'' + files[i].hash_self + '\', $(this).attr(\'name\'), $(this).attr(\'container\'), $(this).attr(\'type\'));state.update($(this).attr(\'container\'), this.id);$(\'#bar-' + (BCV.barID+1) + ' .menubar-title-link\').attr(\'onclick\')',
						'container': BCV.barID
					};
					if (obj.fileType.toLowerCase() == 'folder') {
						obj.basicFileType = 'folder';
						barTypeToMake = 'folder';
					} else {
						switch (getExt(obj.fileName)) {
							case 'txt': case 'log': case 'rtf':
								obj.basicFileType = 'text'
								break;
							case 'js': case 'java': case 'c': case 'cs': case 'cpp': case 'lua': case 'md': case 'css': case 'html': case 'htm': case 'php': case 'json':
								obj.basicFileType = 'code';
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
							case 'pdf':
								obj.basicFileType = 'pdf'
								break;
						}
						barTypeToMake = 'file';
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
		if (barTypeToMake == 'folder')
			$('#bar-' + this.barID + ' .menubar ul').append(this.folderTemplate({model: model}));
		else
			$('#bar-' + this.barID + ' .menubar ul').append(this.fileTemplate({model: model}));
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
});

init.loadFiles();

var state = {
	update: function(cont, id) {
		$('.menubar-content[container="' + cont + '"]').removeClass('menubar-content-active');
		$('#' + id + '.menubar-content[container="' + cont + '"]').addClass('menubar-content-active');
	}, 
	open: function(cont, id) {

	},
	close: function(cont, id) {

	}
}