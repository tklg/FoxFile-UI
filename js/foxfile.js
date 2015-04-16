/*
 * foxfile.js - FoxFile
 * (C) Theodore Kluge 2014-2015
 * villa7.github.io
*/

Dropzone.autoDiscover = false;

var winHeight = $(window).height();
var winWidth = $(window).width();
var res;
var useContextMenu = true;
var codemirrorActive = false;

$(window).resize(function() {
	clearTimeout(res);
	res = setTimeout(function() {
    winHeight = $(window).height();
    winWidth = $(window).width();
    resizeAll();
	}, 100);
});

function resizeAll() {
	init.resize(); //temporary
}

var bar = {
	active: 2,
	lastActive: 0,
	maxActive: 3, //rewrite sizing stuff for smaller screens (2 and 1 across configurations)
	minActive: 2,
	currentOffset: 0,
	fullscreen: false,
	add: function(title, moveBack, type, onclick, hash) {
		bar.active++;
		var aT = this.active; //temp thing for dz
		$('#wrapper').append('<section class="bar bar-vertical" fileHash="' + hash + '" id="bar-' + this.active + '" type="' + type + '" state="closed" filename="' + title + '">' +
			'<div class="menubar-title">'+
			'<span class="heightsettertext"></span>'+
			'<span class="menubar-title-link" onclick="">' + title + '</span>'+
			'<div class="menubar-action-btn">'+
			'<span class="heightsettertext"></span>'+
			'<button class="btn btn-new-folder" id="menubar-action-btn"><i class="fa fa-plus-circle"></i></button>'+
			'<button class="btn btn-download" id="menubar-action-btn" filename="' + title + '" fileHash="' + hash + '" onclick="files.download($(this).attr(\'filename\'), $(this).attr(\'fileHash\'));"><i class="fa fa-download"></i></button>'+
			'<button class="btn btn-upload" id="menubar-action-btn-' + this.active + '"><i class="fa fa-upload"></i></button>'+
			'<button class="btn btn-rename" id="menubar-action-btn" filename="' + title + '" fileHash="' + hash + '" bar="' + this.active + '" onclick="files.renameGUI.show($(this).attr(\'filename\'), $(this).attr(\'fileHash\'), $(this).attr(\'bar\'));"><i class="fa fa-pencil-square-o"></i></button>'+
			'<button class="btn btn-delete" id="menubar-action-btn" filename="' + title + '" fileHash="' + hash + '" bar="' + this.active + '" onclick="files.deleteGUI.show($(this).attr(\'filename\'), $(this).attr(\'fileHash\'), $(this).attr(\'bar\'));"><i class="fa fa-trash"></i></button>'+
			'<button class="btn btn-refresh" id="menubar-action-btn" onclick="files.refresh(' + this.active + ')"><i class="fa fa-refresh"></i></button>'+
			'<button class="btn btn-move" id="menubar-action-btn" filename="' + title + '" fileHash="' + hash + '" bar="' + this.active + '" onclick="files.moveGUI.show($(this).attr(\'filename\'), $(this).attr(\'fileHash\'))"><i class="fa fa-arrow-circle-right"></i></button>'+
			'<button class="btn btn-fullscreen" id="menubar-action-btn" onclick="bar.toggleFullScreen()"><i class="fa fa-expand"></i></button>'+
			'<button class="btn btn-dropdown" id="menubar-action-btn" fileHash="' + hash + '" fileid="' + this.active + '" type="' + type + '" state="closed" filename="' + title + '"><i class="fa fa-bars"></i></button>'+
			'</div>'+
			'</div>'+
			'<div class="menubar menubar-left dropzone" id="dropzone-' + this.active + '">'+
			'<ul id="file-target" class="file-target"></ul>'+
			'<ul id="dz-preview-target-' + this.active + '"></ul>'+
			'<div class="spinner" id="' + this.active + '"><div class="loading up"></div><div class="loading down"></div></div>'+
			'</div></section>');
		if (type === 'folder') {
			$("#dropzone-" + this.active).dropzone({
				url: "dbquery.php?upload_target=" + hash,
				clickable: '#menubar-action-btn-' + aT,
				createImageThunbnails: false,
				dictDefaultMessage: '',
				previewsContainer: '#dz-preview-target-' + aT,
				previewTemplate: $("#preview-template").html(),
				uploadMultiple: false,
				init: function() {
					var num = 0;
					var first = '';
					var isFirst = true;
					this.on('addedfile', function(file) {
						num++;
						if (isFirst) {
							first = file.name;
							isFirst = false;
						}
					});
					this.on('removedfile', function(file) {
						num--;
						if (num === 0) {
							isFirst = true;
							first = '';
						}
					});
					this.on('queuecomplete', function(file) {
						d.success("Uploaded " + first + ((num != 1) ? " and " + (num-1) + " others to " + title : ' to ' + title));
						num = 0;
						first = '';
						isFirst = true;
						setTimeout(function() {
							files.refresh(aT);
						}, 700)
					});
					this.on('sending', function(file) {
						//d.info('Sending file ' + file.name);
					});
					this.on('success', function(file, response) {
						//d.info(response);
					});
				}
			});
		}
		//sets the newly added bar to offscreen on the right
		if (this.active == this.lastActive) {
			bar.move(this.active, 3);
			//d.info("moved in same");
		} else if (this.active < this.lastActive) {
			bar.move(this.active, 2);
			bar.size(this.active, 3);
			bar.move(this.active+1, 5);
			//d.info("moved back");
		} else if (this.active != 2) bar.move(this.active, 5);
		//d.info("active: " + this.active);
		//d.info("lastactive: " + this.lastActive);
		this.lastActive = this.active;

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
		spinners.show(bar);
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

		if (this.active > 3) {
			$('.return-to-main').fadeIn();
		} else {
			$('.return-to-main').fadeOut();
		}
	},
	moveLeft: function(bar) {
		var barpos = parseInt($('#bar-' + bar).attr("pos"));
		//if (barpos > 0) {
			//console.log("moving bar " + bar + " left");
			this.move(bar, barpos - 1);
		//}
	},
	moveRight: function(bar) {
		var barpos = parseInt($('#bar-' + bar).attr("pos"));
		//if (barpos < bar.maxActive) {
			//console.log("moving bar " + bar + " right");
			this.move(bar, barpos + 1);
		//}
	},
	updatePos: function(bar) {
		$('#bar-' + bar).attr("pos", bar);
	},
	home: function() {
		for (i = 3; i <= this.active; i++) {
			this.remove(i);
		}
		this.move(1, 1);
		this.move(2, 2);
		this.size(1, 1);
		this.size(2, 3);
	},
	toggleFullScreen: function() {
		if (this.fullscreen) {
			if (this.active == this.minActive) {
				this.move(this.active, 2);
				this.size(this.active, 3);
			} else {
				this.move(this.active, 3);
				this.size(this.active, 2);
			}
			$('.btn-fullscreen i').addClass('fa-expand').removeClass('fa-compress');
			this.fullscreen = false;
		} else {
			this.move(this.active, 1);
			this.size(this.active, 4);
			$('.btn-fullscreen i').addClass('fa-compress').removeClass('fa-expand');
			this.fullscreen = true;
		}
	},
	exitFullScreen: function() {
		if (this.fullscreen) {
			if (this.active == this.minActive) {
				this.move(this.active, 2);
				this.size(this.active, 3);
			} else {
				this.move(this.active, 3);
				this.size(this.active, 2);
			}
			this.fullscreen = false;
		}
	},
	selected: [],
	cIndex: 0,
	refreshSelected: function() {
		setTimeout(function() {
			files.refresh(bar.selected[bar.cIndex]);
			if (bar.cIndex < bar.selected.length) {
				bar.refreshSelected()
				bar.cIndex++;
			} else {
				bar.cIndex = 0;
			}
		}, 400);
	},
	refreshAll: function() {
		setTimeout(function() {
			files.refresh(bar.cIndex + 2);
			if (bar.cIndex < bar.active - 1) {
				bar.refreshAll();
				bar.cIndex++;
			} else {
				bar.cIndex = 0;
			}
		}, 400);
	}
}
//to set the pos attribute on the original 2 bars
bar.updatePos(1);
bar.updatePos(2);
var modalActive = false;
var files = {
	open: function (hash, title, bar_id, type, onclick) {
		bar.exitFullScreen();
		document.title = pageTitle + title_separator + title;
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
			/*setTimeout(function() {

			}, 400)*/
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
		$('.debug#dropzones-count').text($('.dropzone').length);
		$('.debug#barid').text(bar.active);
	},
	refresh: function(bar_id) {
		bar.clear(bar_id);
		spinners.show(bar_id);
		clickMenu.rebind();
		//show spinny to give time for query
		setTimeout(function() {
			bar.fill(bar_id, $('.bar#bar-' + bar_id).attr('filehash'), $('.bar#bar-' + bar_id).attr('type'));
		}, 500);
	},
	renameGUI: {
		show: function(file, id, bar) {
			$('.modal-rename').addClass('modal-active');
			$('.modal-rename .modal-header #modal-header-name').text(file);
			$('.modal-rename #modal-file-id-rename').val(id);
			$('.modal-rename #modal-bar-id-rename').val(bar);
			$('.modal-rename #modal-file-name-rename').val(file);
			$('.modal-rename').fadeIn();
			$('.modal-rename #modal-file-name-rename').focus();
			$('.modal-rename #modal-file-name-rename').select();
			modalActive = true;
		},
		hide: function() {
			$('.modal-rename').fadeOut();
			$('.modal-rename').removeClass('modal-active');
			setTimeout(function () {
				$('.modal-rename .modal-header #modal-header-name').text('FOLDER');
				$('.modal-rename #modal-file-id-rename').val('');
				$('.modal-rename #modal-file-name-rename').val('');
			}, 500);
			modalActive = false;
		}
	},
	rename: function(file, id, bar) {
		$.post('dbquery.php',
		{
			rename: 'rename',
			file_id: id,
			name: file
		},
		function(result) {
			if (result == 1) {
				//worked
			} else {
				d.error(result);
			}
			files.refresh(bar);
			files.renameGUI.hide();
		});
	},
	deleteGUI: {
		show: function(file, id, bar) {
			if (multiSelect.numSelected > 1) {
				files.multiDeleteGUI.show(multiSelect.selected);
			} else {
				$('.modal-delete').addClass('modal-active');
				$('.modal-delete .modal-header #modal-header-name').text(file);
				$('.modal-delete #modal-file-id-delete').val(id);
				$('.modal-delete #modal-bar-id-delete').val(bar);
				$('.modal-delete').fadeIn();
				modalActive = true;
			}
		},
		hide: function() {
			$('.modal-delete').fadeOut();
			$('.modal-delete').removeClass('modal-active');
			setTimeout(function () {
				$('.modal-delete .modal-header #modal-header-name').text('FOLDER');
				$('.modal-delete #modal-file-id-delete').val('');
			}, 500);
			modalActive = false;
		}
	},
	delete: function(file, id, bar) {
		if (multiSelect.numSelected > 1) {
				files.multiDelete(multiSelect.selected);
		} else {
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
				files.refresh(bar);
				files.deleteGUI.hide();
			});
		}
	},
	uploadGUI: function(target, file, id) {

	},
	upload: function(target, file, id) {

	},
	newFolderGUI: {
		show: function(file, id, bar) {
			$('.modal-new-folder').addClass('modal-active');
			$('.modal-new-folder .modal-header #modal-header-name').text(file);
			$('.modal-new-folder #modal-file-id-new').val(id);
			$('.modal-new-folder #modal-bar-id-new').val(bar);
			$('.modal-new-folder').fadeIn();
			$('.modal-new-folder #modal-file-name-new').focus();
			modalActive = true;
		},
		hide: function() {
			$('.modal-new-folder').fadeOut();
			$('.modal-new-folder').removeClass('modal-active');
			setTimeout(function () {
				$('.modal-new-folder .modal-header #modal-header-name').text('FOLDER');
				$('.modal-new-folder #modal-file-id-new').val('');
				$('.modal-new-folder #modal-file-name-new').val('');
			}, 500);
			modalActive = false;
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
				if (result == 'success') { //worked
					//d.success("Created new folder in " + id + " called " + title);
					//refresh folder bar
					//d.info('refreshing bar ' + bar + ' with id ' + id);
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
	},
	moveGUI: {
		show: function(file, id) {
			//d.info(file+'<br>'+id);
			$('.modal-move').addClass('modal-active');
			if (multiSelect.numSelected < 2) {
				$('.modal-move .modal-header #modal-header-name').text(file);
			} else {
				$('.modal-move .modal-header #modal-header-name').text(file + ", and " + (multiSelect.numSelected - 1) + " others");
			}
			$('.modal-move #modal-file-id-move').val(id);
			//$('.modal-move #modal-bar-id-move').val(bar);
			$('.modal-move .minibar-file-id').attr({
				'filehash': id,
				'filename': file
			});
			$('.modal-move').fadeIn();
			$('.modal-move .modal-content').css({
				'height':  parseInt($('.modal-move .modal').css('height')) - (parseInt($('.modal-move .modal-header').css('height')) + parseInt($('.modal-move .modal-footer').css('height'))) - 22 + 'px'
			});
			if (minibar.open(userRoot, file, id)) {
				//
			}
			modalActive = true;
		},
		hide: function() {
			$('.modal-move').fadeOut();
			minibar.reset();
			modalActive = false;
		}
	},
	multiMove: function(file, target) { //handles moving both single and multiple files
		if (multiSelect.numSelected < 2) {
			if (!_.isArray(file)) { //if its a single thing
				var tmp = [file];
				file = tmp;
			}
		} else {
			file = multiSelect.selected;
		}
		var hashes = _.uniq(file);
		var filesList = hashes.toString();
		//d.info("moving " + filesList + " to " + target);
		$.post('dbquery.php',
		{
			move: 'move',
			file_multi: filesList,
			file_target: target
		},
		function(result) {
			if (result == '') {
				//worked
				bar.refreshAll();
				multiSelect.reset();
				files.moveGUI.hide();
			} else {
				d.error(result);
			}
			//files.refresh(bar);
		});
	},
	multiDeleteGUI: {
		show: function() {
			var hashes = _.uniq(multiSelect.selected);
			$('.modal-delete').addClass('modal-active');
			$('.modal-delete .modal-header #modal-header-name').text(multiSelect.numSelected + " Items");
			$('.modal-delete').fadeIn();
			modalActive = true;
		},
		hide: function() {
			$('.modal-delete').fadeOut();
			$('.modal-delete').removeClass('modal-active');
			setTimeout(function () {
				$('.modal-delete .modal-header #modal-header-name').text('FOLDER');
				$('.modal-delete #modal-file-id-delete').val('');
			}, 500);
			modalActive = false;
		}
	},
	multiDelete: function(file) {
		var hashes = _.uniq(file);
		//d.info(hashes.toString());
		$.post('dbquery.php',
		{
			multi_delete: 'delete',
			file_multi: hashes.toString()
		},
		function(result) {
			if (result == '') {
				//worked
				d.info("Deleted items.");
			} else {
				d.error(result);
				console.log(result);
			}
			//files.refresh(bar);
			files.deleteGUI.hide();
			bar.refreshSelected();
			//bar.selected = [];
			multiSelect.reset();
		});
	},
	download: function(file, id, type) {
		if (multiSelect.selected.length > 1 || type == 'folder') {
			this.multiDownload(file, id, type);
		} else {
			var frame = $("<iframe></iframe>").attr('src', 'dbquery.php?download&file_id='+id+"&file_name="+file).css('display', 'none');
			frame.appendTo('body');
			setTimeout(function() {
				$('body > iframe, body > input[type="file"]').remove();
			}, 10000); //let it attempt to download for 10 seconds
		}
	},
	multiDownload: function(file, id, type) {
		if (multiSelect.selected.length > 1) {
			var hashes = _.uniq(multiSelect.selected);
		} else {
			var hashes = [id];
		}
		//d.info("Downloading " + hashes.toString());
		if (type != 'folder') type = 'file';
		//d.info("Type: " + type);
		var frame = $("<iframe></iframe>").attr('src', 'dbquery.php?multi_download&file_id='+hashes.toString()+"&file_name="+file+"&file_type="+type).css('display', 'none');
		frame.appendTo('body');
		setTimeout(function() {
			$('body > iframe, body > input[type="file"]').remove();
			multiSelect.reset();
		}, 10000); //let it attempt to download for 10 seconds
		//d.warning("File zipping is not added yet, sorry :c");
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
		container: '',
		units: '',
		last_modified_date: '',
		last_modified_time: '',
		is_checked: ''
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
var draggingFile = false;
var BarContentView = Backbone.View.extend({
	folderTemplate: _.template($('#folder_template').html()),
	fileTemplate: _.template($('#file_template').html()),
	barTypeToMake: '',
	initialize: function() {
		this.collection.on('reset', this.render, this);
		c = this.collection;
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
						'onclick': 'files.open($(this).attr(\'filehash\'), $(this).attr(\'name\'), $(this).attr(\'container\'), $(this).attr(\'type\'), this.id);state.update($(this).attr(\'container\'), this.id);$(\'#bar-\' + ($(this).attr(\'container\') + 1) + \' .menubar-title-link\').attr(\'onclick\')',
						'container': BCV.barID,
						'units': 'bytes',
						'last_modified_date': files[i].last_modified.split(', ')[0] + ', ' + files[i].last_modified.split(', ')[1],
						'last_modified_time': files[i].last_modified.split(', ')[2]
					};
					if (files[i].file_size > 1000) {
						if (files[i].file_size > 1000000) {
							if (files[i].file_size > 1000000000) {
								obj.units = 'gigabytes';
								obj.fileSize = (obj.fileSize / 1000000000).toFixed(2);
							} else {
								obj.units = 'megabytes';
								obj.fileSize = (obj.fileSize / 1000000).toFixed(2);
							}
						} else {
							obj.units = 'kilobytes';
							obj.fileSize = (obj.fileSize / 1000).toFixed(2);
						}
					}
					if (obj.fileType.toLowerCase() == 'folder') {
						obj.basicFileType = 'folder';
						//this.barTypeToMake = 'folder';
						obj.fileType = 'Folder';
					} else {

						var fObj = fileTypeDetails.get(getExt(obj.fileName).toLowerCase());
						obj.basicFileType = fObj.basicFileType;
						obj.fileType = fObj.fileType;

						this.barTypeToMake = 'file'; //usually overridden by a file after this - if this is the only thing opened (file was opened to view) this will stay
						obj.script = "<script type=\"text/javascript\">previews.getPreviewImage('" + obj.hash_self + "', " + obj.fileID + ", '" + obj.basicFileType + "');" + 
					    "</script>";
						obj.is_checked = (_.contains(multiSelect.selected, obj.hash_self) ? "checked" : "");
					}

					arr.push(obj);
					//console.log(obj);
				}
				//spinners.hide(this.barID);
				c.reset(arr);
			},
			error: function() {

			}
		});
	},
	render: function() {
		this.collection.each(this.list, this);
		spinners.hide(this.barID);
	},
	list: function(model) {
		//console.log("Appending template to #bar-" + this.barID);
		if (this.barTypeToMake != 'folder') {
			$('#bar-' + this.barID + ' .menubar ul#file-target').append(this.fileTemplate({model: model}));
		} else {
			$('#bar-' + this.barID + ' .menubar ul#file-target').append(this.folderTemplate({model: model}));
			//bind draggable to each thing
			$("#bar-" + this.barID + " li.menubar-content:not(.menubar-content-main)").draggable({
				opacity: 0.9,
				helper: "clone",
				revert: 'invalid',
				cursorAt: {
					top: 15,
					left: 100
				},
				appendTo: 'body',
				distance: 6,
				scroll: false,
				start: function() {
					$("li.menubar-content:not(.menubar-content-main)").css({
						'-webkit-transition': 'none',
		            	'transition': 'none'
					});
					draggingFile = true;
					currentDraggingFolder = '';
				},
				stop: function(e, ui) {
					$("li.menubar-content:not(.menubar-content-main)").css({
						'-webkit-transition': 'all .2s ease-in-out',
		            	'transition': 'all .2s ease-in-out'
					});
					draggingFile = false;
				}
			});
			$('#bar-' + this.barID + ' .menubar:not(.menubar-main)').droppable({
				hoverClass: 'dz-drag-hover',
				tolerance: 'pointer',
				drop: function(event, ui) {
					currentTargetFolder = $(this).parents('.bar').attr('filehash');
					//d.info("set currentTargetFolder to " + currentTargetFolder);
					currentDraggingFolder = _.clone(multiSelect.selected);
					currentDraggingFolder[multiSelect.selected.length] = $(ui.helper).attr('filehash');
					currentDraggingFolder = _.uniq(currentDraggingFolder);
					if (_.contains(currentDraggingFolder, currentTargetFolder)) {
						d.warning("You cannot drop a folder into itself!");
						//also check the file path in the php script before trying to change anything
						//if (getPath(file).contains(targetFolder)) { //return error }
					} else {
						//d.info("dropped " + currentDraggingFolder.toString() + " on " + currentTargetFolder);
						files.multiMove(currentDraggingFolder, currentTargetFolder);
					}
					currentDraggingFolder = null;
				}
			});
			$('#bar-' + this.barID + ' li.menubar-content[type="folder"]:not(.menubar-content-main)').droppable({
				hoverClass: 'dragdrop-hover',
				tolerance: 'pointer',
				greedy: true,
				drop: function(e, ui) {
					if ($(this).is('li')) {
						currentTargetFolder = $(this).attr('filehash');
					} else {
						currentTargetFolder = $(this).parents('.menybar-content').attr('filehash');
					}
					d.info("set currentTargetFolder to " + currentTargetFolder);
					currentDraggingFolder = _.clone(multiSelect.selected);
					currentDraggingFolder[multiSelect.selected.length] = $(ui.helper).attr('filehash');
					currentDraggingFolder = _.uniq(currentDraggingFolder);
					if (_.contains(currentDraggingFolder, currentTargetFolder)) {
						d.warning("You cannot drop a folder into itself!");
						//also check the file path in the php script before trying to change anything
						//if (getPath(file).contains(targetFolder)) { //return error }
					} else {
						//d.info("dropped " + currentDraggingFolder.toString() + " on " + currentTargetFolder);
						files.multiMove(currentDraggingFolder, currentTargetFolder);
					}
					currentDraggingFolder = null;
				}
			});
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
			collection: BCL,
			barID: target_element,
			barTypeToMake: type
		});
		BCV.barID = target_element;
		BCV.barTypeToMake = type;
	}
});
var minibar = {
	//prev: ['70111f8e5d30bba774011b2762aa4e4c9e278bc017d413983339907240c45f85'], //the SHA256 hash of "foxfilerootfolder". If you name a folder this, it will break.
	prev: [userRoot],
	numActive: 1,
	active: '',
	open: function(folder, tFile, tID) {
		if (this.numActive < 1) {
			//this.prev[0] = '70111f8e5d30bba774011b2762aa4e4c9e278bc017d413983339907240c45f85';
			this.prev[0] = userRoot;
			this.numActive = 1;
		} else {
			$('.modal-move .spinner').fadeIn(0);
			this.active = folder;
			if (!_.contains(this.prev, folder)) this.prev[this.numActive] = folder;
			this.numActive = this.prev.length;
			//d.info("minibar.open('"+folder+"')");
			//d.info("Prev: " + this.prev.toString());
			//d.info("active: " + this.numActive);
			$.post('dbquery.php',
				{
					minibar_dir: folder
				},
				function(result) {
					if (result != '0') { //worked
						$('.modal-move .modal-content').html(result);
						//d.info(result);
					} else {
						d.error(":(");
					}
					$('.modal-move .spinner').fadeOut(0);
					return true;
			});
		}
	},
	back: function() {
		//d.info("minibar.back()");
		this.prev = _.without(this.prev, this.active);
		//d.info("removing " + this.active + " from prev");
		this.numActive = this.prev.length;
		//d.info("back active: " + this.numActive);
		this.open(this.prev[this.numActive - 1]);
	},
	reset: function(folder) {
		//this.prev[0] = '70111f8e5d30bba774011b2762aa4e4c9e278bc017d413983339907240c45f85';
		this.prev = [userRoot];
		this.numActive = 1;
	}
}
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

//meh
function clickButton(btn, id) {
	$(btn + id).click();
}

var clickMenu = {
	fn: 'd.info(\'unadded clickmenu item\');',
	isOpen: false,
	height: 380,
	width: 200,
	open: function(posX, posY, bar, file, type, id) {
		//d.info('Opening clickmenu at (' + posX + ', ' + posY + ") in bar " + bar + " at file " + file + " of type " + type);
		if (this.isOpen) this.close();
		$('body').append('<div class="clickmenu" type="' + type + '" bar="' + bar + '" file="' + file + '" id="' + id + '"><ul></ul><div>');
		if (type == 'folder') {
			items = ['<i class="fa fa-trash-o"></i> Delete',
			'<i class="fa fa-pencil-square-o"></i> Rename',
			'<i class="fa fa-upload"></i> Upload',
			'<i class="fa fa-download cm-btn-download"></i> Download',
			'<i class="fa fa-plus-circle"></i> New Folder',
			'<i class="fa fa-share-square-o cm-btn-share"></i> Share',
			'<i class="fa fa-arrow-circle-right cm-btn-move"></i> Move',
			'<i class="fa fa-refresh"></i> Refresh'];
		} else {
			items = ['<i class="fa fa-trash-o"></i> Delete',
			'<i class="fa fa-pencil-square-o"></i> Rename',
			'<i class="fa fa-download cm-btn-download"></i> Download',
			'<i class="fa fa-share-square-o cm-btn-share"></i> Share',
			'<i class="fa fa-arrow-circle-right cm-btn-move"></i> Move',
			'<i class="fa fa-refresh"></i> Refresh'];
		}

		this.height = 40 * items.length;

		for(i = 0; i < items.length; i++) {
			switch(items[i].toLowerCase().split('</i>')[1].trim()) {
				case 'delete':
					this.fn = 'files.deleteGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'), $(this).attr(\'bar\'));clickMenu.close();" cmm="delete';
					break;
				case 'rename':
					this.fn = 'files.renameGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'), $(this).attr(\'bar\'));clickMenu.close();" cmm="rename';
					break;
				case 'download':
					this.fn = 'files.download($(this).attr(\'file\'), $(this).attr(\'id\'), $(this).parents(\'.clickmenu\').attr(\'type\'));clickMenu.close();" cmm="download';
					break;
				case 'upload':
					this.fn = 'clickButton(\'#menubar-action-btn-\', $(this).attr(\'bar\'))';
					break;
				case 'new folder':
					this.fn = 'files.newFolderGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'), $(this).attr(\'bar\'));clickMenu.close();';
					break;
				case 'share':
					this.fn = 'files.shareGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'));clickMenu.close();" cmm="share'; //not hacky at all
					break;
				case 'refresh':
					this.fn = 'files.refresh($(this).attr(\'bar\'));clickMenu.close();';
					break;
				case 'move':
					this.fn = 'files.moveGUI.show($(this).attr(\'file\'), $(this).attr(\'id\'));clickMenu.close();" cmm="move';
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
		$('.menubar:not(.menubar-main)').bind("contextmenu", function(e) {
			if (useContextMenu && !$(e.target).parents().hasClass('CodeMirror')) {
				e.preventDefault();
				//d.info($(e.target).attr("class"));
				if ($(e.target).is('li')) { //is a file bar
					var bar = $(e.target).attr('container');
					var file = $(e.target).attr('name');/*onclick').split(',')[1].trim().replace(/'/g, '');*/
					var type = $(e.target).attr('type');
					var id = $(e.target).attr('filehash');
				} else {
					if (!$(e.target).is('div')) { //is within a file bar
						var bar = $(e.target).parents('li').attr('container');
						var file = $(e.target).parents('li').attr('name');/*onclick').split(',')[1].trim().replace(/'/g, '');*/
						var type = $(e.target).parents('li').attr('type');
						var id = $(e.target).parents('li').attr('filehash');
						//d.info('in');
					} else { //is the empty space under the bar
						var bar = $(e.target).parents('section').attr('id').split('-')[1];
						var file = $(e.target).parents('section').attr('filename');
						var type = $(e.target).parents('section').attr('type');
						var id = $(e.target).parents('section').attr('filehash');
						//d.info("under");
					}
				}
				cmWidth = 200;
				cmHeight = clickMenu.height;
				if (e.pageY > winHeight - cmHeight) {
					if (e.pageX > winWidth - cmWidth)
						clickMenu.open(e.pageX - cmWidth, e.pageY - (cmHeight / 2), bar, file, type, id);
					else
						clickMenu.open(e.pageX, e.pageY - (cmHeight / 2), bar, file, type, id);
				} else {
					if (e.pageX > winWidth - cmWidth)
						clickMenu.open(e.pageX - cmWidth, e.pageY, bar, file, type, id);
					else
						clickMenu.open(e.pageX, e.pageY, bar, file, type, id);
				}
				files.newFolderGUI.hide();
			}
		});
		$('.menubar').bind("click", function(e) {
			if (!$(e.target).parents('.clickmenu').length > 0/* && !$(e.target).parents('.menubar-action-btn') > 0*/) {
				clickMenu.close();
			}
		});
		$('.modal-background').on('click', function(e) {
			if (!$(e.target).parents('.modal').length > 0 && !$(e.target).is('.modal')) {
				files.newFolderGUI.hide();
				files.deleteGUI.hide();
				files.renameGUI.hide();
				files.moveGUI.hide();
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
var previews = {
	getPreviewImage: function(hash, target, type) {
		setTimeout(function() {
			if (type == 'text' || type == 'code') {
				spinners.text.show();
				$.post('dbquery.php',
				{
					read_file: hash
				},
				function(data) {
					codemir.setcontent(target, data);
					codemir.seteditor(hash);
					//$('.menubar-content-view#' + target + ' .text-preview').html(data.replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;'));
					//$('.menubar-content-view#' + target + ' .text-preview').html(data);
				});
			} else if (type == 'audio') {
				var ext = getExt(hash);
				switch(ext) {
					case 'mp3': 
						type = 'audio/mpeg';
						break;
					case 'wav': 
						type='audio/wav';
						break;
					case 'ogg': 
						type='audio/ogg';
						break;
				}
				$('.menubar-content-view#' + target + ' .audio-preview').attr('src', 'dbquery.php?preview=' + hash).attr('type', type);
			} else if (type == 'video') {
				$('.menubar-content-view#' + target + ' .video-preview').attr('src', 'dbquery.php?preview=' + hash);
			} else if (type == 'image') {
				setTimeout(function() {
					$('.menubar-content-view#' + target + ' .img-preview').attr('src', 'dbquery.php?preview=' + hash);
				}, 500);
			}
		}, 500);
	}
}
var spinners = {
	show: function(bar) {
		$('.spinner#' + bar).fadeIn();
	},
	hide: function(bar) {
		$('.spinner#' + bar).fadeOut();
	},
	text: {
		show: function() {
			$('.text-preview .spinner').fadeIn();
		},
		hide: function() {
			$('.text-preview .spinner').fadeOut();
		}
	}
}
function setContent(stuff) {
	$('.bar-alt .spinner').fadeIn();
	$.post('dbquery.php',
		{
			getContent: stuff
		},
		function(result) {
			//hide spinny
			if (result != "") { //worked
				$('.bar-alt .menubar').append(result);
				$('.bar-alt .spinner').fadeOut();
			} else {
				//failed to retrieve alt pages
			}
	});
}
var multiSelect = {
	selected: [],
	numSelected: 0,
	add: function(hash) {
		this.selected[this.selected.length] = hash;
		this.numSelected++;
		//d.info(this.selected.toString());
	},
	remove: function(hash) {
		this.selected = _.without(this.selected, hash);
		this.numSelected--;
		//d.info(this.selected.toString());
	},
	reset: function() {
		this.selected = [];
		this.numSelected = 0;
		$('.file-multiselect-checkbox-container input').prop("checked", false); //uncheck all
		setTimeout(function() {
			bar.selected = [];
		}, 200);
	}
}
$(document).keydown(function(e) {
	if (e.keyCode == 32) { //spacebar
		if (!modalActive && !codemirrorActive) bar.toggleFullScreen();
	}
	if (e.keyCode == 13) { //enter
		if (modalActive) $('.modal-active .modal-footer .btn-submit').click();
	}
});
var dragging = false;
$(document).on('mousedown', "li.menubar-content:not(.menubar-content-main)", function(e) {
	if (!codemir.saved) codemir.savecontent();
	var posX = e.pageX,
		posY = e.pageY;
    $(window).mousemove(function(m) {
    	if (Math.abs(m.pageX - posX) > 5 || Math.abs(m.pageY - posY) > 5) {
        	dragging = true;
        	if (multiSelect.numSelected > 0) {
        		if (_.contains(multiSelect.selected, $('.ui-draggable-dragging').attr("filehash"))) {
        			if (multiSelect.numSelected > 1) {
        				$('.ui-draggable-dragging .file-name').text($('.ui-draggable-dragging .file-name').text() + " and " + (multiSelect.numSelected - 1) + " others");
        			} else {
        				$('.ui-draggable-dragging .file-name').text($('.ui-draggable-dragging .file-name').text());
        			}
        		} else {
        			$('.ui-draggable-dragging .file-name').text($('.ui-draggable-dragging .file-name').text() + " and " + (multiSelect.numSelected) + " others");
        		}
        	} else {
        		$('.ui-draggable-dragging .file-name').text($('.ui-draggable-dragging .file-name').text());
        	}
        	$(window).unbind("mousemove");
    	}
    });
}).on('mouseup', "li.menubar-content:not(.menubar-content-main, .menubar-content-user)", function(e) {
    var wasDragging = dragging;
    dragging = false;
    $(window).unbind("mousemove");
    if (!wasDragging) { //was clicking
		//if ($(e.target).parents('.menubar-content').length > 0) {
		if ($(e.target).text() == '') { //if the checkbox was clicked

		} else {
			if (e.which == 1) { //left click only
				if (e.shiftKey || e.ctrlKey) { //check the checkbox
					$('.file-multiselect-checkbox-container input[type="checkbox"][value="' + $(this).attr('filehash') + '"]').click();
				} else { //open file/folder
					files.open($(this).attr('filehash'), $(this).attr('name'), $(this).attr('container'), $(this).attr('type'), this.id);
					state.update($(this).attr('container'), this.id);
					$('#bar-' + ($(this).attr('container') + 1) + ' .menubar-title-link').attr('onclick');
				}
			}
		}
    } else {
    	
    }
});
$(document).on('mousedown', "li.minibar-content", function(e) {
	if (e.which == 1) { //left click only
		if ($(this).attr('id') == 'minibar-back') {
			minibar.back();
		//} else if ($(this).is('.minibar-content-target')) {
		} else {
			minibar.open($(this).attr('filehash'));
		}
	}
});
$(document).mouseup(function() { //in case user unclicks not over the list
    if (dragging) {
	    dragging = false;
	    $(window).unbind("mousemove");
	}
});
$(document).on('click', '#menubar-action-btn.btn-dropdown', function(e) {
	if (e.which == 1) { //left click only
		if (clickMenu.isOpen) {
			clickMenu.close();
		} else {
			clickMenu.open(e.pageX - 180, 60, $(this).attr('fileid'), $(this).attr('filename'), $(this).attr('type'), $(this).attr('filehash'));
		}
	}
});
$(document).on('change', '.file-multiselect-checkbox-container input', function() {
	if (this.checked) {
		multiSelect.add($(this).parents('.menubar-content').attr('filehash'));
		bar.selected[bar.selected.length] = $(this).parents('.menubar-content').attr('container');
		bar.selected = _.sortBy(_.uniq(bar.selected), function(n) {return n;});
	} else {
		multiSelect.remove($(this).parents('.menubar-content').attr('filehash'));
		bar.selected = _.sortBy(_.without(bar.selected, $(this).parents('.menubar-content').attr('container')), function(n) {return n;});
	}
});
var currentTargetFolder = '';
var currentDraggingFolder = [];
var editor; //codemirror editor object
var codemir = {
	saved: true,
	seteditor: function(file) {
		mode1 = getExt(file);
		var mode = null;
		var det = fileTypeDetails.get(mode1);
		mode = det.language;
		var mime = null;
		mime = det.mime;

		editor = CodeMirror.fromTextArea($('#editor')[0], {
			lineNumbers: true,
			lineWrapping: false,
			theme: 'twilight',
			indentWithTabs: true,
			readOnly: false,
			keyMap: 'sublime',
		    foldGutter: true,
		    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		    extraKeys: {
    			"Ctrl-S": function(instance) { codemir.savecontent(instance.getValue()); }
    		}
		});
		editor.on('focus', function() {
			codemirrorActive = true;
		});
		editor.on('blur', function() {
			codemirrorActive = false;
			codemir.savecontent();
		});
		editor.on('change', function() {
			if (codemir.saved) {
				codemir.saved = false;
				//d.warning("Content changed");
				$('.cm-save-status i').attr('class', 'fa fa-save');
			}
		});
		if (mode != null && mode != '') {
			//d.info("Loading mode: " + mode);
			$.getScript('js/cm-mode/'+mode+'/'+mode+'.js', function() {
				if (mime != null && mime != '') {
					//d.info("Setting mode to " + mime + '<br>js/cm-mode/'+mode+'/'+mode+'.js');
					editor.setOption("mode", mime);
				} else {
					//d.info("Setting mode to " + mode + '<br>js/cm-mode/'+mode+'/'+mode+'.js');
					editor.setOption("mode", mode);
				}
		   		//d.info("Initialized CodeMirror");
			});
		}

		$(".bar.bar-vertical[active='true'] .menubar-title-link").html($(".bar.bar-vertical[active='true'] .menubar-title-link").text() + '<span class="cm-save-status" onclick="codemir.savecontent()" title="Save Status"><i class="fa fa-circle-o"></i></span>');
	},
	savecontent: function() {
		if (!codemir.saved) {
			editor.save();
			codemir.saved = true;
			d.info("Saving...");
			$('.cm-save-status i').attr('class', 'fa fa-spinner fa-spin');
			$.post('dbquery.php',
			{
				cm_save: 'cm_save',
				file: $(".bar.bar-vertical[active='true']").attr('filehash'),
				content: editor.getValue()
			},
			function(result) {
				//hide spinny
				if (result == '') { //worked
					$('.cm-save-status i').attr('class', 'fa fa-circle-o');
					d.success("Saved!");
				} else {
					$('.cm-save-status i').attr('class', 'fa fa-warning');
					d.error("Failed to save file:<br>" + result);
				}
			});
		}
	},
	setcontent: function(target, content) {
		$('.menubar-content-view#' + target + ' .text-preview').html(content);
		//d.info("Set editor content");
		//$('.menubar-content-view#' + target + ' .ace_text-input').html(content);
	}
}
var fileTypeDetails = {
	get: function(ext) {
		if (ext.indexOf('/') > 0) { //'/place/thing/file.ext'
			ext = getExt(ext);
		} else { //ext from getExt

		}
		var bft = 'file';
		var language = ''; //if it is code
		var dft = '';
		var mime = '';

		switch (ext) {
			case 'txt':
				bft = 'text';
				dft = 'Text File';
				language = '';
				break;
			case 'log':
				bft = 'text';
				dft = 'Log File';
				language = '';
				break;
			case 'rtf':
				bft = 'text';
				dft = 'Rich Text';
				language = '';
				break;
			case 'js':
				bft = 'code';
				dft = 'Javascript';
				language = 'javascript';
				break;
			case 'java':
				bft = 'code';
				dft = 'Java File';
				language = 'clike'; //cm doesnt have a mode for java
				mime = 'text/x-java';
				break;
			case 'bat':
				bft = 'code';
				dft = 'Batch File';
				language = '';
				break;
			case 'c':
				bft = 'code';
				dft = 'C File';
				language = 'clike';
				mime = 'text/x-csrc';
				break;
			case 'cs':
				bft = 'code';
				dft = 'C# File';
				language = 'clike';
				mime = 'text/x-csharp';
				break;
			case 'cpp':
				bft = 'code';
				dft = 'C++ File';
				language = 'clike';
				mime = 'text/x-c++src';
				break;
			case 'lua':
				bft = 'code';
				dft = 'LUA Script';
				language = 'lua';
				break;
			case 'md':
				bft = 'code';
				dft = 'Markdown File';
				language = 'markdown';
				break;
			case 'css':
				bft = 'code';
				dft = 'CSS File';
				language = 'css';
				break;
			case 'scss':
				bft = 'code';
				dft = 'Sass File';
				language = 'scss';
				break;
			case 'html':
				bft = 'code';
				dft = 'HTML File';
				language = 'htmlmixed';
				break;
			case 'htm':
				bft = 'code';
				dft = 'HTM File';
				language = 'htmlmixed';
				break;
			case 'php':
				bft = 'code';
				dft = 'PHP Script';
				language = 'php';
				break;
			case 'json':
				bft = 'code';
				dft = 'JSON File';
				language = 'json';
				break;
			case 'rb':
				bft = 'code';
				dft = 'Ruby File';
				language = 'ruby';
				break;
			case 'py':
				bft = 'code';
				dft = 'Python Script';
				language = 'python';
				break;
			case 'sql':
				bft = 'code';
				dft = 'SQL Script';
				language = 'sql';
				break;
			case 'vbs':
				bft = 'code';
				dft = 'Visual Basic';
				language = 'vbs';
				break;
			case 'ino':
				bft = 'code';
				dft = 'Arduino Sketch';
				language = 'clike';
				mime = "text/x-csrc";
				break;
			case 'dat':
				bft = 'text';
				dft = 'Data File';
				language = 'text';
				break;
			case 'xml':
				bft = 'text';
				dft = 'XML Sheet';
				language = 'xml';
				break;
			case 'aif':
				bft = 'audio';
				dft = 'AIFF Audio';
				break;
			case 'm4a':
				bft = 'audio';
				dft = 'MPEG-4 Audio';
				break;
			case 'mid':
				bft = 'audio';
				dft = 'MIDI File';
				break;
			case 'mp3':
				bft = 'audio';
				dft = 'MP3 Audio';
				break;
			case 'mpa':
				bft = 'audio';
				dft = 'MPEG-2 Audio';
				break;
			case 'wav':
				bft = 'audio';
				dft = 'Waveform Audio';
				break;
			case 'wma':
				bft = 'audio';
				dft = 'Windows Audio';
				break;
			case 'avi':
				bft = 'video';
				dft = 'AVI Video';
				break;
			case 'm4v':
				bft = 'video';
				dft = 'M4V Video';
				break;
			case 'mov':
				bft = 'video';
				dft = 'Movie File';
				break;
			case 'mp4':
				bft = 'video';
				dft = 'MP3 Video';
				break;
			case 'mpg':
				bft = 'video';
				dft = 'MPEG Video';
				break;
			case 'wmv':
				bft = 'video';
				dft = 'Windows Video';
				break;
			case 'bmp':
				bft = 'image';
				dft = 'Bitmap Image';
				break;
			case 'jpg':
				bft = 'image';
				dft = 'JPEG Image';
				break;
			case 'png':
				bft = 'image';
				dft = 'PNG Image';
				break;
			case 'psd':
				bft = 'image';
				dft = 'Photoshop Document';
				break;
			case 'tga':
				bft = 'image';
				dft = 'TARGA Image';
				break;
			case 'gif':
				bft = 'image';
				dft = 'Animated GIF';
				break;
			case 'svg':
				bft = 'image';
				dft = 'Scalable Vector';
				break;
			case 'ai':
				bft = 'image';
				dft = 'Illustrator Document';
				break;
			case 'zip':
				bft = 'zip';
				dft = 'ZIP Archive';
				break;
			case 'gz':
				bft = 'zip';
				dft = 'GNU Archive';
				break;
			case 'rar':
				bft = 'zip';
				dft = 'RAR Archive';
				break;
			case 'pkg':
				bft = 'zip';
				dft = 'Package Archive';
				break;
			case '7z':
				bft = 'zip';
				dft = '7Zip Archive';
				break;
			case 'pdf':
				bft = 'pdf';
				dft = 'Adobe PDF';
				break;
			default:
				bft = 'file';
				dft = ext.toUpperCase() + ' File';
				break;
		}
		//create and return object with stuff
		var details = {
			ext: ext,
			basicFileType: bft,
			fileType: dft,
			language: language,
			mime: mime
		}
		return details;
	}
}