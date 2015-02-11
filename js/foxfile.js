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

function resizeAll() {
	init.resize(); //temporary
}

var bar = {
	active: 2,
	maxActive: 3,
	currentOffset: 0,
	add: function(title, moveBack, type, onclick, hash) {
		bar.active++;
		$('#wrapper').append('<section class="bar bar-vertical" fileHash="' + hash + '" id="bar-' + this.active + '" type="' + type + '" state="closed" filename="' + title + '"> <div class="menubar-title"><span class="heightsettertext"></span><i class="bar-backbutton btn fa fa-angle-left"></i><span class="menubar-title-link btn" onclick="' + onclick + '">' + title + '</div> <div class="menubar menubar-left"> <ul> </ul> </div> </section>');
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
	fill: function(bar, file_key, type) {
		//parent_key = '',
		BCL = new BarContentLoader();
		BCL.start(bar, file_key, type);
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
	open: function (hash, title, bar_id, type, onclick) {
		//console.log("clicked on file in bar " + bar_id);
		//console.log("hash: " + hash);
		//console.log("title: " + title);
		if (bar_id == bar.active) { //user clicked on the active bar, make a new one to the right
			//console.log("Clicked on active bar");
			bar.add(title, true, type, onclick, hash);
			bar.fill(bar.active, hash, type);
			bar.setActive(bar.active);
		} else { //user clicked on a bar back in the stack, remove all after it and remake the needed folder/file
/* possibly make it so that it removes all that it needs to and leaves the one directly to the right */
			//console.log("Clicked on inactive bar");
			var diff = bar.active - bar_id;
			//console.log("difference: " + diff);
			if (bar.active > bar.maxActive && diff != 1) {
				for (i = 1; i <= bar.active; i++) {
					bar.moveRight(i);
					//console.log("Moved bar " + i + " right");
				}
			}
			for (i = 0; i < diff; i++) {
				//console.log("removing active bar: " + bar.active);
				bar.remove(bar.active);
			}
			bar.add(title, false, type, onclick, hash);
			bar.fill(bar.active, hash, type);
			bar.setActive(bar.active);
		}
		if (bar_id == 1) {
			bar.size(2, 3);
		}
		clickMenu.rebind();
		$('.debug#dir').text(title);
	},
	refresh: function(bar_id) {
		bar.clear(bar_id);
		clickMenu.rebind();
		//show spinny to give time for query
		setTimeout(function() {
			bar.fill(bar_id, $('.bar#bar-' + bar_id).attr('filehash'), $('.bar#bar-' + bar_id).attr('type'));
		}, 500);
	},
	renameGUI: {
		show: function(file, id, bar) {
			$('.modal-rename .modal-header #modal-header-name').text(file);
			$('.modal-rename #modal-file-id').val(id);
			$('.modal-rename #modal-bar-id').val(bar);
			$('.modal-rename').fadeIn();
		},
		hide: function() {
			$('.modal-rename').fadeOut();
			setTimeout(function () {
				$('.modal-rename .modal-header #modal-header-name').text('FOLDER');
				$('.modal-rename #modal-file-id').val('');
				$('.modal-rename .modal-content-input').val('');
			}, 500);
		}
	},
	rename: function(file, id, bar) {
		$.post('dbquery.php',
		{
			rename: 'rename',
			file_id: id
		},
		function(result) {
			d.info(result);
			files.refresh(bar);
		});
	},
	deleteGUI: {
		show: function(file, id, bar) {
			$('.modal-delete .modal-header #modal-header-name').text(file);
			$('.modal-delete #modal-file-id').val(id);
			$('.modal-delete #modal-bar-id').val(bar);
			$('.modal-delete').fadeIn();
		},
		hide: function() {
			$('.modal-delete').fadeOut();
			setTimeout(function () {
				$('.modal-delete .modal-header #modal-header-name').text('FOLDER');
				$('.modal-delete #modal-file-id').val('');
			}, 500);
		}
	},
	delete: function(file, id, bar) {
		$.post('dbquery.php',
		{
			delete: 'delete',
			file_id: id
		},
		function(result) {
			if (result == 1) {
				//worked
			} else {
				d.error(result);
			}
			files.refresh(bar, id);
			files.deleteGUI.hide();
		});
	},
	download: function(file, id) {
		$.post('dbquery.php',
		{
			download: 'download',
			file_id: id
		},
		function(result) {
			d.info(result);
		});
	},
	uploadGUI: function(target, file, id) {

	},
	upload: function(target, file, id) {

	},
	newFolderGUI: {
		show: function(file, id, bar) {
			$('.modal-new-folder .modal-header #modal-header-name').text(file);
			$('.modal-new-folder #modal-file-id').val(id);
			$('.modal-new-folder #modal-bar-id').val(bar);
			$('.modal-new-folder').fadeIn();
		},
		hide: function() {
			$('.modal-new-folder').fadeOut();
			setTimeout(function () {
				$('.modal-new-folder .modal-header #modal-header-name').text('FOLDER');
				$('.modal-new-folder #modal-file-id').val('');
				$('.modal-new-folder .modal-content-input').val('');
			}, 500);
		}
	},
	newFolder: function(title, id, bar) {
		if (title == "") {
			d.warning("Folder name cannot be blank.");
		} else {
			//show creation spinny
			$.post('dbquery.php',
			{
				new_folder: 'new_folder',
				title: title,
				file_id: id
			},
			function(result) {
				//hide spinny
				d.info(result);
				if (result == 'success') { //worked
					d.success("Created new folder in " + id + " called " + title);
					//refresh folder bar
					d.info('refreshing bar ' + bar + ' with id ' + id);
					files.refresh(bar);
				} else {
					switch(result) {

					}
				}
				files.newFolderGUI.hide();
			});
		}
	},
	shareGUI: {
		show: function(file, id) {

		},
		hide: function() {
			
		}
	},
	share: function(file, id) {
		$.post('dbquery.php',
		{
			share: 'share',
			file_id: id
		},
		function(result) {
			//open fileshare modal
			//get file url from db

			d.info(result);
		});
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
	model: BarContentModel,
	parent_key: '',
	type: '',
	url: function() {
		return 'dbquery.php?dir=' + this.parent_key + '&type=' + this.type;
	}
	//url: 'dbquery.php?dir=home_dir'
});
var BCL, BCV;
var barTypeToMake;

var BarContentView = Backbone.View.extend({
	barID: '',
	folderTemplate: _.template($('#folder_template').html()),
	fileTemplate: _.template($('#file_template').html()),
	barTypeToMake: '',
	initialize: function() {
		//console.log('BarContentView initialized');
		this.collection.on('reset', this.render, this);
		c = this.collection;
		//fade in loading spinny
		//d.success("GET from " + c.url());
		this.collection.fetch({
			success: function(model, response) {
				//console.info("Loaded model");
				var files = response;
				//console.log(files[0].name);
				var arr = [];
				for (var i = 0; i < files.length; i++) {
					obj = {
						'fileID': files[i].PID,
						'fileName': files[i].file_name,
						'fileType': files[i].file_type,
						'basicFileType': '',
						'fileSize': files[i].file_size,
						'hash_self': files[i].file_self,
						'hash_child': files[i].file_child,
						'hash_parent': files[i].file_parent,
						'onclick': 'files.open(\'' + files[i].file_self + '\', $(this).attr(\'name\'), $(this).attr(\'container\'), $(this).attr(\'type\'), this.id);state.update($(this).attr(\'container\'), this.id);$(\'#bar-' + (BCV.barID+1) + ' .menubar-title-link\').attr(\'onclick\')',
						'container': BCV.barID
					};
					if (obj.fileType.toLowerCase() == 'folder') {
						obj.basicFileType = 'folder';
						//this.barTypeToMake = 'folder';
						obj.fileType = 'Folder';
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
						switch(getExt(obj.fileName)) {
							/* text files */
							case 'txt':
								obj.fileType = "Text File";
								break;
							case 'log':
								obj.fileType = 'Log File';
								break;
							case 'rtf':
								obj.fileType = 'Rich Text Format';
								break;
							case 'md':
								obj.fileType = 'Markdown File';
								break;
								/* data files */
							case 'dat':
								obj.fileType = 'Data File';
								break;
							case 'xml':
								obj.fileType = 'DEFINE PLS';
								break;
							case 'dat':
								obj.fileType = 'Data File';
								break;
							case 'json':
								obj.fileType = 'JSON File';
								break;
							/* Image files */
							case 'bmp':
								obj.fileType = 'Bitmap Image';
								break;
							case 'jpg':
								obj.fileType = 'JPEG Image';
								break;
							case 'png':
								obj.fileType = 'Portable Network Graphic';
								break;
							case 'psd':
								obj.fileType = 'Adobe Photoshop Document';
								break;
							case 'tga':
								obj.fileType = 'TARGA Image';
								break;
							case 'gif':
								obj.fileType = 'Animated GIF';
								break;
							case 'svg':
								obj.fileType = 'Scalable Vector Graphic';
								break;
							case 'ai':
								obj.fileType = 'Adobe Illustrator Image';
								break;
							/* video files */
							case 'wmv':
								obj.fileType = 'Windows Movie';
								break;
							/* archives */
							case 'zip':
								obj.fileType = 'ZIP Archive';
								break;
							case '7z':
								obj.fileType = '7zip Archive';
								break;
							case 'gz':
								obj.fileType = 'GZ Archive';
								break;
							case 'rar':
								obj.fileType = 'RAR Archive';
								break;
							/* scripts and code files */
							case 'js':
								obj.fileType = 'Javascript File';
								break;
							case 'rb':
								obj.fileType = 'Ruby Script';
								break;
							case 'py':
								obj.fileType = 'Python Script';
								break;
							case 'bat':
								obj.fileType = 'Batch File';
								break;
							case 'vbs':
								obj.fileType = 'Visual Basic Script';
								break;
							/* other */
							case 'pdf':
								obj.fileType = 'Adobe PDF';
								break;
							default: 
								obj.fileType = getExt(obj.fileName).toUpperCase() + ' File';
								break;
						}
						//obj.fileType += ' File';
						this.barTypeToMake = 'file'; //usually overridden by a file after this - if this is the only thing opened (file was opened to view) this will stay
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
		if (this.barTypeToMake != 'folder') {
			$('#bar-' + this.barID + ' .menubar ul').append(this.fileTemplate({model: model}));
		} else {
			$('#bar-' + this.barID + ' .menubar ul').append(this.folderTemplate({model: model}));
		}
	}
});
var BarContentLoader = Backbone.Router.extend({
	routes: {
		'': 'start'
	},
	start: function(target_element, file_key, type) {
		//console.log("BarcontentLoader");
		BCL = null;
		BCV = null;
		BCL = new BarContentList({
			//parent_key: file_key
		});
		BCL.parent_key = file_key;
		BCL.type = type;
		//BCL.parent_key = parent_key;
		//BCL.parent_key = file_key;
		//BCL.url = src_url; //not needed, all queries are sent to dbquery.php
		BCV = new BarContentView({
			collection: BCL
		});
		BCV.barID = target_element;
		BCV.barTypeToMake = type;
	}
});

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

var clickMenu = {
	fn: 'd.info(\'unadded clickmenu item\');',
	isOpen: false,
	open: function(posX, posY, bar, file, type, id) {
		//d.info('Opening clickmenu at (' + posX + ', ' + posY + ") in bar " + bar + " at file " + file + " of type " + type);
		if (this.isOpen) this.close();
		$('body').append('<div class="clickmenu" bar="' + bar + '" file="' + file + '" id="' + id + '"><ul></ul><div>');
		if (type == 'folder') {
			items = ['<i class="fa fa-trash-o"></i> Delete',
			'<i class="fa fa-pencil-square-o"></i> Rename',
			'<i class="fa fa-upload"></i> Upload',
			'<i class="fa fa-download"></i> Download',
			'<i class="fa fa-plus-circle"></i> New Folder',
			'<i class="fa fa-share-square-o"></i> Share'];
		} else {
			items = ['<i class="fa fa-trash-o"></i> Delete',
			'<i class="fa fa-pencil-square-o"></i> Rename',
			'<i class="fa fa-download"></i> Download',
			'<i class="fa fa-share-square-o"></i> Share'];
		}

		for(i = 0; i < items.length; i++) {
			switch(items[i].toLowerCase().split('</i>')[1].trim()) {
				case 'delete':
					this.fn = 'files.deleteGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'), $(this).attr(\'bar\'));clickMenu.close();';
					break;
				case 'rename':
					this.fn = 'files.renameGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'), $(this).attr(\'bar\'));clickMenu.close();';
					break;
				case 'download':
					this.fn = 'files.download($(this).attr(\'file\'), $(this).attr(\'id\'));clickMenu.close();';
					break;
				case 'upload':
					this.fn = 'files.uploadGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'));clickMenu.close();';
					break;
				case 'new folder':
					this.fn = 'files.newFolderGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'), $(this).attr(\'bar\'));clickMenu.close();';
					break;
				case 'share':
					this.fn = 'files.shareGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'));clickMenu.close();';
					break;
			}
			$('.clickmenu ul').append('<li class="btn" onclick="' + this.fn + '" bar="' + bar + '" file="' + file + '" id="' + id + '">' + items[i] + '</li>');
		}

		$('.clickmenu').css({
			'left': posX + 'px',
			'top': posY + 'px'
		});
		this.isOpen = true;
	},
	close: function() {
		$('.clickmenu').remove();
		this.isOpen = false;
	},
	rebind: function() {
		$('.bar:not(.bar-main)').bind("contextmenu", function(e) {
			e.preventDefault();
			//d.info($(e.target).attr("class"));
			if ($(e.target).is('li')) { //is a file bar
				var bar = $(e.target).attr('container');
				var file = $(e.target).attr('name');/*onclick').split(',')[1].trim().replace(/'/g, '');*/
				var type = $(e.target).attr('type');
				var id = $(e.target).attr('filehash');
			} else {
				if (!$(e.target).is('section')) { //is within a file bar
					var bar = $(e.target).parents('li').attr('container');
					var file = $(e.target).parents('li').attr('name');/*onclick').split(',')[1].trim().replace(/'/g, '');*/
					var type = $(e.target).parents('li').attr('type');
					var id = $(e.target).parents('li').attr('filehash');
				} else { //is the empty space under the bar
					var bar = $(e.target).attr('id').split('-')[1];
					var file = $(e.target).attr('filename');
					var type = $(e.target).attr('type');
					var id = $(e.target).attr('filehash');
				}
			}
			cmWidth = 200;
			cmHeight = 239;
			if (e.pageY > winHeight - cmHeight) {
				if (e.pageX > winWidth - cmWidth)
					clickMenu.open(e.pageX - cmWidth, e.pageY - cmHeight, bar, file, type, id);
				else
					clickMenu.open(e.pageX, e.pageY - cmHeight, bar, file, type, id);
			} else {
				if (e.pageX > winWidth - cmWidth)
					clickMenu.open(e.pageX - cmWidth, e.pageY, bar, file, type, id);
				else
					clickMenu.open(e.pageX, e.pageY, bar, file, type, id);
			}
			files.newFolderGUI.hide();
		});
		$(document).bind("click", function(e) {
			if (!$(e.target).parents('.clickmenu').length > 0) {
				clickMenu.close();
			}
		});
		$('.modal-background').on('click', function(e) {
			if (!$(e.target).parents('.modal').length > 0) {
				files.newFolderGUI.hide();
				files.deleteGUI.hide();
				files.renameGUI.hide();
			}
		});
	}
}
var names = {
	res: '',
	get: function(id) {
		var res = 'unset';
		$.post('dbquery.php',
		{
			fullNameFromID: id
		},
		function(result) {
			if(result != '') $('#display_name').text(result);
		});
	}
}
