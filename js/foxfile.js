/* 
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                                  
    Foxfile : foxfile.js 
    Copyright (C) 2016 Theodore Kluge
    http://tkluge.net
*/
(function(foxfile, $, undefined) {
    foxfile.init = function(){
        page.init();
        fm.init();
        dd.init();
        foxfile.routerbox.init();
    }
    foxfile.routerbox = {
        router: null,
        init: function() {
            console.info("Initialize router");
            var ViewsFactory = {};
            var Router = Backbone.Router.extend({
                routes: {
                    "files/*filePath": "loadPath",
                    "shared": "openShared",
                    "trash": "openTrash",
                    "transfers": "openTransfers"
                }
            });
            this.router = new Router();
            this.router.on('route:loadPath', function(filePath) {
                if (filePath.lastIndexOf('/') == filePath.length - 1)
                    filePath = filePath.substr(0, filePath.length - 1);
                console.log("Preloading path: " + filePath);
                var loadQueue = filePath.split('/');
                if (loadQueue.length > 1) {
                    for (i = 1; i < loadQueue.length; i++) {
                        console.log(loadQueue[i]);
                        fm.open(loadQueue[i]);
                    }
                }
            });
            this.router.on('route:openShared', function(filePath) {
                $('.pages #shared').addClass('active').css('z-index', 401).siblings().css('z-index', 400);
                $('.pages #shared').siblings().removeClass('active');
                /*setTimeout(function() {
                }, 500);*/
                console.log("Switched to page shared");
            });
            this.router.on('route:openTrash', function(sort) {
                $('.pages #trash').addClass('active').css('z-index', 401).siblings().css('z-index', 400);
                $('.pages #trash').siblings().removeClass('active');
                /*setTimeout(function() {
                }, 500);*/
                console.log("Switched to page trash");
            });
            this.router.on('route:openTransfers', function(sort) {
                $('.pages #transfers').addClass('active').css('z-index', 401).siblings().css('z-index', 400);
                $('.pages #transfers').siblings().removeClass('active');
                /*setTimeout(function() {
                }, 500);*/
                console.log("Switched to page transfers");
            });
            Backbone.history.start();
        }
    }
    var page = {
        width: $(window).width(),
        numBarsCanBeActive: 1,
        init: function() {
            console.info("Initialize page");
            this.calculateBars();
        },
        calculateSize: function() {
            this.calculateBars();
        },
        calculateBars: function() {
            this.width = $(window).width();
            var minWidth = 280;
            var curWidth = (this.width / 5) - 1;
            minWidth = Math.max(minWidth, curWidth);
            var activeBarWidth = this.width / 6;
            console.log("Active bar width should be " + activeBarWidth + "px");
            var barsActive = 0;
            while(barsActive * minWidth < (this.width - activeBarWidth)) {
                barsActive++;
            }
            barsActive-=2;
            this.numBarsCanBeActive = barsActive;
            fm.numBarsCanBeActive = this.numBarsCanBeActive;
            fm.barWidth = minWidth;
            fm.activeBarWidth = this.width - ((this.numBarsCanBeActive - 1) * minWidth);
            console.log('Calculated '+barsActive+' bars active on this screen size ('+this.width+'px), each ' + fm.barWidth + "px wide");
            return barsActive;
        },
        updateFMToFitSize: function() {
            fm.resizeToFitCurrentlyActive();
            fm.moveToFitCurrentlyActive();
        },
        changeContent: function(el) {
            this.content.empty().append(el);
            return this;
        },
        setTitle: function(str) {
            return $('title').text(str);
        }
    }

    var rightnav = {
    	isOpen: false,
    	toggle: function() {
    		if (this.isOpen) this.close();
    		else this.open();
    	},
    	open: function() {
    		$('#nav-right').addClass('active');
    		this.isOpen = true;
    	},
    	close: function() {
    		$('#nav-right').removeClass('active');
    		this.isOpen = false;
    	}
    }

    $(document).on('click', '.btn-ctrlbar', function(e) {
    	$(this).addClass('active').siblings().removeClass('active');
        if ($(this).attr('id') == 'files') {
            $('.pages').children().removeClass('active').css('z-index', 400);
            if (fm.isActive) { // switch to root
                fm.back('all');
                return;
            } else {
                fm.isActive = true;
                var path = fm.calcFilePath();
                foxfile.routerbox.router.navigate('files/'+path, {replace: true});
                return;
            }
        } else {
            fm.isActive = false;
            foxfile.routerbox.router.navigate($(this).attr('id'), {trigger: true, replace: true});
        }
    });
    $(document).on('click', '.user-menu, .nav-right-active-cover, #nav-right .closeOnClick', function(e) {
    	console.log("Toggling right nav");
    	rightnav.toggle();
    });
    var res;
    $(window).resize(function() {
        clearTimeout(res);
        res = setTimeout(function() {
            page.calculateSize();
            page.updateFMToFitSize();
        }, 100);
    });
})(window.foxfile = window.foxfile || {}, jQuery);
/*  
header3 font
######## ##     ## 
##       ###   ### 
##       #### #### 
######   ## ### ## 
##       ##     ## 
##       ##     ## 
##       ##     ##
*/        
(function(fm, $, undefined) {
    fm.isActive = true;
    fm.numBarsCanBeActive = 1;
    fm.barWidth = 280;
    fm.activeBarWidth = 560;
    fm.last = null;
    var hashTree = [];
    var fileTree = [];
    var currentFilePath = '';
    var width = 0;
    fm.init = function() {
        console.info("Initialize FileManager");
        this.width = $(window).width();
        $('#bar-0').css({
            'width': fm.barWidth + 'px'
        });

        fm.open(foxfile_root);

        /*setTimeout(function() {
            $('.bar, .file-manager').css({
                transition: 'all 0.45s ease-in-out'
            });
        }, 500);*/
        setTimeout(function() {
            $('.file-manager').css({
                transition: 'all 0.45s ease-in-out'
            });
        }, 500);
    }
    fm.getLast = function() {
        fm.last = fileTree[fileTree.length - 1];
        return fm.last;
    }
    fm.get = function(index) {
        return fileTree[index];
    }
    fm.getFileTree = function() {
        return fileTree;
    }
    fm.getHashTree = function() {
        return hashTree;
    }
    fm.getFromHash = function(hash) {
        for (i = 0; i < fileTree.length; i++) {
            if (fileTree[i].getHash() == hash) return fileTree[i];
        }
    }
    fm.open = function(hash) {
        var item = null;
        //var resType = type;
        var fHash = hash;
        var isRoot = null;
        if (hash == foxfile_root) isRoot = true;
        $.ajax({
            type: "POST",
            url: "./api/files/get_file_info",
            data: {
                hash: fHash
            },
            success: function(result) {
                var json = JSON.parse(result);
                console.log("fm.open("+fHash+") [1] Got response from server: ");
                var name; 
                var hash;
                var parent;
                var isFolder;
                if (isRoot) {
                    name = "My Files";
                    hash = foxfile_root;
                    parent = 'root';
                    isFolder = true;
                } else {
                    name = json.name;
                    hash = json.hash;
                    parent = json.parent;
                    isFolder = json.is_folder == '1' ? true : false;
                }
                if (isFolder) {
                    item = new FolderBar(name, hash, parent);
                    $.ajax({
                        type: "POST",
                        url: "./api/files/list_files",
                        data: {
                            hash: hash,
                            offset: 0,
                            limit: 30
                        },
                        success: function(result) {
                            var json = JSON.parse(result);
                            console.log("fm.open("+fHash+") [2] Got response from server: ");
                            console.log(json);
                            var hasMore = json['more'];
                            var resultsRemaining = json['remaining'];
                            var res = json['results'];
                            var files = [];
                            $.each(res, function(i) {
                                // name, parent, icon, hash, type, btype, size, lastmod, shared, public
                                files.push(new File(res[i].name,
                                                    res[i].parent,
                                                    res[i].icon,
                                                    res[i].hash,
                                                    res[i].type,
                                                    res[i].is_folder == '1' ? "folder" : "file",
                                                    res[i].size,
                                                    res[i].lastmod,
                                                    res[i].is_shared,
                                                    res[i].is_public));
                            });
                            item.setFiles(files);
                            item.setRemaining(resultsRemaining);
                            item.setHasMore(hasMore);
                            fm.add(item);
                            // get the current file path so that the router can append this to it
                            var path = fm.calcFilePath()/* + dest*/;
                            foxfile.routerbox.router.navigate('files/'+path, {/*trigger: true, */replace: true});
                        },
                        error: function(request, error) {
                            //console.error(request, error);
                        }
                    });
                } else if (!isFolder) {
                    item = new FileBar(name, hash, parent);
                    $.ajax({
                        type: "POST",
                        url: "./api/files/get_file",
                        data: {
                            hash: hash
                        },
                        success: function(result) {
                            var json = JSON.parse(result);
                            console.log("fm.open("+fHash+") [2] Got response from server: ");
                            console.log(json);
                            file = new File(json.name,
                                                json.parent,
                                                json.icon,
                                                json.hash,
                                                json.type,
                                                json.size,
                                                json.lastmod,
                                                json.is_shared,
                                                json.is_public);
                            item.setFile(file);
                            fm.add(item);
                            // get the current file path so that the router can append this to it
                            var path = fm.calcFilePath()/* + dest*/;
                            foxfile.routerbox.router.navigate('files/'+path, {/*trigger: true, */replace: true});
                        },
                        error: function(request, error) {
                            //console.error(request, error);
                        }
                    });
                }
            },
            error: function(request, error) {
                //console.error(request, error);
            }
        });
    }
    fm.calcFilePath = function() {
        var filePath = '';
        for (i = 0; i < fileTree.length; i++) {
            filePath += fileTree[i].hash + '/';
        }
        this.currentFilePath = filePath;
        return filePath;
    }
    fm.add = function(barItem) {
        console.log("adding barItem: " + barItem.getHash());

        document.title = barItem.name + " - FoxFile";

        if (barItem.getParent() == hashTree[hashTree.length - 2]) { // opening a file from the same folder
            fm.remove(fm.getLast());
        } else if (_.indexOf(hashTree, barItem.getParent()) < (hashTree.length - 2)) {
            var ind = _.indexOf(hashTree, barItem.getParent());
            fm.remove(fm.get(ind));
        }

        fileTree.push(barItem);
        hashTree.push(barItem.getHash());

        var template = null;
        if (barItem instanceof FolderBar) {
            template = _.template($('#fm-folder').html());
        } else if (barItem instanceof FileBar) {
            template = _.template($('#fm-file-detail').html());
        } else {
            console.warn("Tried to call fm.replace(barItem) with illegal argument \"" + barItem + "\"");
            return;
        }
        $('.file-manager').append(template(barItem));
        $('.file-manager .bar[hash='+barItem.getHash()+']').removeClass('loading');
        if (fileTree.length > 1) fileTree[fileTree.length - 2].setWidth(fm.barWidth);
        
        barItem.loadContent();
        dd.addListener(barItem);

        if (fileTree.length > fm.numBarsCanBeActive) {
            $('.file-manager .bar[hash='+(fileTree[(fileTree.length - 1) - fm.numBarsCanBeActive].getHash())+']').addClass('leftmost').siblings().removeClass('leftmost');
        } else {
            $('.file-manager .bar').removeClass('leftmost');
        }
        fm.resizeToFitCurrentlyActive();
        fm.moveToFitCurrentlyActive();
    }
    fm.remove = function(barItem) {
        if (barItem.getHash() == fm.getLast().getHash()) { // removing the last one
            console.log("removing last ("+fm.getLast().getHash()+")");
            $('.file-manager .bar[hash='+fileTree.pop().getHash()+']').remove();
            hashTree.pop();
        } else {
            console.log("removing all after ("+fm.getLast().getHash()+"), inclusive");
            for (i = _.indexOf(fileTree, barItem); i < fileTree.length; i++) {
                $('.file-manager .bar[hash='+fileTree.pop().getHash()+']').remove();
                hashTree.pop();
            }
        }
        //document.title = fm.getLast().name + " - FoxFile";
        fm.resizeToFitCurrentlyActive();
        fm.moveToFitCurrentlyActive();
    }
    fm.back = function(num) {
        if (num == 'all') {
            if (fileTree.length > 1) {
                fm.remove(fileTree[0]);
            }
            foxfile.routerbox.router.navigate('files/'+foxfile_root+'/', {replace: true});
        } else {
            fm.remove(fileTree[fileTree.length - 1]);
            var path = fm.calcFilePath();
            foxfile.routerbox.router.navigate('files/'+path, {/*trigger: true, */replace: true});
        }
        if (fileTree.length > fm.numBarsCanBeActive) {
            $('.file-manager .bar[hash='+(fileTree[(fileTree.length - 1) - fm.numBarsCanBeActive].getHash())+']').addClass('leftmost').siblings().removeClass('leftmost');
        } else {
            $('.file-manager .bar').removeClass('leftmost');
        }
    }
    fm.moveToFitCurrentlyActive = function() {
        if (fileTree.length > this.numBarsCanBeActive) {
            $('.file-manager').css({
                'left': -1 * this.barWidth * (fileTree.length - this.numBarsCanBeActive) + 'px'
            });
            console.log("Moving file manager " + -1 * this.barWidth * (fileTree.length - this.numBarsCanBeActive) + 'px to the left (' + (fileTree.length - this.numBarsCanBeActive) + ' bars)');
        } else {
            $('.file-manager').css({
                'left': 0
            })
        }
    }
    fm.resizeToFitCurrentlyActive = function() {
        if (fileTree.length > this.numBarsCanBeActive) {
            $('.file-manager').css({
                'width': this.width + (this.barWidth * (fileTree.length - this.numBarsCanBeActive)) + 'px'
            });
            console.log("Resizing file manager " + (this.width + (this.barWidth * (fileTree.length - this.numBarsCanBeActive))) + 'px');
        } else {
            $('.file-manager').css({
                'width': '100%'
            });
        }
    }
    var FolderBar = function(name, hash, parent) {
        this.name = name;
        this.hash = hash;
        this.parent = parent;
        this.hasMore = false;
        this.remaining = 0;
        this.files = []; // all files contained within this folder
        this.getName = function() {return this.name;}
        this.getHash = function() {return this.hash;}
        this.getParent = function() {return this.parent;}
        this.getFiles = function() {return this.files;}
        this.setFiles = function(fileGroup) {this.files = fileGroup;}
        this.loadContent = function() {
            console.log("Loading bar " + this.hash + " content: " + this.files.length + " files");
            if (this.files.length > 0) {
                var template = _.template($('#fm-file').html());
                $('#bar-'+this.hash+' .file-list').empty();
                for (i = 0; i < this.files.length; i++) {
                    $('#bar-'+this.hash+' .file-list').append(template(this.files[i]));
                }
            } else {
                var template = _.template($('#fm-folder-empty').html());
                $('#bar-'+this.hash+' .file-list').empty();
                $('#bar-'+this.hash+' .file-list').append(template({}));
            }
        }
        this.setWidth = function(size) {
            console.log("Sizing bar " + this.hash + " to " + size + 'px');
            $('#bar-'+this.hash).css({
                'width': size + 'px'
            });
        }
        this.moveTo = function(pos) {
            console.log("Moving bar " + this.hash + " to pos " + pos + " (" + fm.barWidth * pos + 'px from the left)');
            $('#bar-'+this.hash).css({
                'left': fm.barWidth * pos + 'px'
            });
        }
        this.setHasMore = function(has) {
            this.hasMore = has;
        }
        this.setRemaining = function(num) {
            this.remaining = num;
        }
    }
    var FileBar = function(name, hash, parent, type, file) {
        this.name = name;
        this.hash = hash;
        this.parent = parent;
        this.type = type;
        this.hasMore = false;
        this.remaining = 0;
        this.file = file;
        this.getName = function() {return this.name;}
        this.getHash = function() {return this.hash;}
        this.getParent = function() {return this.parent;}
        this.getType = function() {return this.type;}
        this.getJsonData = function() {return this.jsonData;}
        this.setHasMore = function(has) {
            this.hasMore = has;
        }
        this.setRemaining = function(num) {
            this.remaining = num;
        }
        this.setFile = function(fileItem) {
            this.file = fileItem;
        }
        this.getType = function() {
            return this.file.getType();
        }
        this.loadContent = function() {
            console.log("Loading bar " + this.hash + " content");
            /*var template = _.template($('#fm-file-view').html());
            for (i = 0; i < this.files.length; i++) {
                $('#bar-'+this.hash+' .file-view').append(template(this.files[i]));
            }*/
        }
    }
    var File = function(name, parent, icon, hash, type, btype, size, lastmod, shared, public) {
        this.name = name;
        this.parent = parent;
        this.icon = icon;
        this.hash = hash;
        this.btype = btype;
        this.type = type;
        this.size = size;
        this.lastmod = new Date(lastmod);
        this.shared = shared == '0' ? false : true;
        this.public = public == '0' ? false : true;
        this.getName = function() {return this.name;}
        this.getParent = function() {return this.parent;}
        this.getHash = function() {return this.hash;}
        this.getIcon = function() {
            return getIcon(this);
        }
        this.getType = function() {
            return getType(this);
        }
        this.isFolder = function() {
            return this.btype == 'folder';
        }
        this.getSize = function() {
            if (!this.isFolder()) {
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
               if (this.size == 0) return '0 Bytes';
               var i = parseInt(Math.log(this.size) / Math.log(1024));
               return (this.size / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
            } else return "&emsp;"; // folders do not display a size
        }
        this.isPublic = function() {return this.public;}
        this.isShared = function() {return this.shared;}
        this.getDate = function() {
            var date = this.lastmod.toDateString().split(' ');
            return date[1]+", "+date[2]+" "+date[3];
        }
        this.getTime = function() {
            return this.lastmod.toLocaleTimeString();
        }
    }
    $(document).on('click', '.file-manager .file-multiselect-checkbox-container', function(e) {
        e.stopPropogation();
    });
    $(document).on('click', '.file-manager .menubar-content:not(.btn-ctrlbar)', function(e) {
        var dest = $(this).attr('hash');
        fm.open(dest);
    });
    $(document).on('click', '.file-manager .btn-back', function(e) {
        fm.back();
    });
})(window.fm = window.fm || {}, jQuery);

/*
8888888b.  8888888b.  
888  "Y88b 888  "Y88b 
888    888 888    888 
888    888 888    888 
888    888 888    888 
888    888 888    888 
888  .d88P 888  .d88P 
8888888P"  8888888P"  
*/

(function(dd, $, undefined) {
    var timer;
    var internal = true;
    var traversalDone = true;
    var hovering = false;
    var queue;
    dd.init = function() {
        console.info("Initializing dragdrop");
        $('body').append('<input type="file" class="dd-input-hidden" id="dd-file-upload" multiple="" />')
                 .on('change', function(e) {
                    startFileDrop(e, this);
                 });
        $('body').append('<input type="file" class="dd-input-hidden" id="dd-folder-upload" multiple webkitdirectory="" directory="" />')
                 .on('change', function(e) {
                    startFolderDrop(e, this);
                 });
        queue = new UploadQueue();
    }
    dd.addListener = function(folder) {
        var hash = folder.getHash();
        console.log("Adding DragDrop listeners to " + hash);
        $('.bar#bar-'+hash).on('dragover dragenter', function(e) {
            e.preventDefault();
            if (!hovering) {
                e = e.originalEvent;
                if (e.dataTransfer) internal = false;
                hovering = true;
                fileDragHover(e, this);
            }
        });
        $('.bar#bar-'+hash).on('dragleave dragend drop', function(e) {
            e.preventDefault();
            e = e.originalEvent;
            hovering = false;
            internal = true;
            fileDragLeave(e, this);
        });
        $('.bar#bar-'+hash).on('drop', function(e) {
            e.preventDefault();
            e = e.originalEvent;
            fileDragDrop(e, this);
        });
    }
    function fileDragHover(e, elem) {
        //e.stopPropogation();
        e.preventDefault();
        window.clearTimeout(timer);
        var hash = $(elem).attr('hash');
        var barItem;
        for (i = 0; i < fm.getHashTree().length; i++) {
            if (fm.getHashTree()[i] == hash) 
                barItem = fm.getFileTree()[i];
        }
        console.log("Hover entered bar " + barItem.getHash());
        if (!internal) { // uploading a new file or folder  
            console.log('new');
        } else { // moving a file or folder
            console.log('move');
        }
    }
    function fileDragLeave(e, elem) {
        //e.stopPropogation();
        e.preventDefault();
        timer = window.setTimeout(function() {
            var hash = $(elem).attr('hash');
            var barItem;
            for (i = 0; i < fm.getHashTree().length; i++) {
                if (fm.getHashTree()[i] == hash) 
                    barItem = fm.getFileTree()[i];
            }
            console.log("Hover left bar " + barItem.getHash());
        }, 25);
    }
    function fileDragDrop(e, elem) {
        console.log("Dropped a file on " + $(elem).attr('id'));
        //e.stopPropogation();
        e.preventDefault();
        console.log(e.dataTransfer);
        var dataTransfer = e.dataTransfer;
        var files = e.target.files || (dataTransfer && dataTransfer.files);
        if (!files || files.length == 0) {
            return false;
        }
        if (ua.ua == 'chrome' 
                && e.dataTransfer
                && e.dataTransfer.items
                && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].webkitGetAsEntry) {
            var items = e.dataTransfer.items;
            for (var i = 0; i < items.length; i++) {
                if (items[i].webkitGetAsEntry) {
                    var item = items[i].webkitGetAsEntry();
                    if (item) {
                        if (i == items.length - 1) {
                            //traversalDone = true;
                        }
                        console.log("starting tree traversal");
                        traverseFileTree(item);
                    }
                }
            }
        } else if (ua.ua == 'firefox' && e.dataTransfer) {
            try {
                for (var i = 0, m = e.dataTransfer.mozItemCount; i < m; ++i) {
                    var file = e.dataTransfer.mozGetDataAt("application/x-moz-file", i);
                    if (file instanceof Ci.nsIFile) {
                        if (i == m - 1) {
                            //traversalDone = true;
                        }
                        console.log("starting tree traversal");
                        traverseFileTree(new mozDirtyGetAsEntry(file));
                    }
                    else {
                        console.log('dd.fileDragDrop: Not a nsIFile', file);
                    }
                }
            }
            catch (e) {
                console.warn(e.getMessage());
            }
        } else if (ua.ua == 'safari' && e.dataTransfer ) {
            // same as for chrome, but replace webkitGetAsEntry with getAsEntry
            // I think
        }

    }
    function traverseFileTree(item, path) {
        path = path || "";
        if (item.isFile) {
            item.file(function(file) {
                //console.log("File: ", path + file.name);
                queue.add(new SmallFile(file, path));
            });
        } else if (item.isDirectory) {
            var dirReader = item.createReader();
            dirReader.readEntries(function(entries) {
                for (i = 0; i < entries.length; i++) {
                    traverseFileTree(entries[i], path + item.name + "/");
                }
            });
        }
    }
    function SmallFile(item, path) {
        this.item = item;
        this.path = path;
        this.id = 'unset';
        this.state = 0;
        this.progress = 0;
        this.getSize = function() {
           var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
           if (this.item.size == 0) return '0 Byte';
           var i = parseInt(Math.log(this.item.size) / Math.log(1024));
           return (this.item.size / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
        }
        this.getName = function() {
            return this.path + this.item.name;
        }
        this.getType = function() {
            return getType(this.item.name);
        }
        this.startUpload = function() {
            var id = this.id;
            $.ajax({
                xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    //var xhr = new window.XMLHttpRequest();
                    var elem = $('#transfers .file-list #tfile-'+id+' .file-upload-progress-bar');
                    if(xhr.upload){
                        xhr.upload.addEventListener('progress', function(e) {
                            if(e.lengthComputable) {
                                elem.css({
                                    width: ((e.loaded / e.total) * 100) + '%'
                                }).attr({value: e.loaded, max: e.total});
                                console.log(e.loaded);
                            }
                        }, false);
                    }
                    return xhr;
                },
                url: './api/files/new',
                type: 'POST',
                enctype: 'multipart/form-data',
                data: {
                    file: this.item,
                    name: this.item.name,
                    parent: this.path.split('/')[this.path.split('/').length - 2],
                    path: this.path
                },
                beforeSend: function() {
                    $('#transfers .file-list #tfile-'+id+' .nameandprogress').addClass('active');
                    $('#transfers .file-list #tfile-'+id+' .file-upload-status').text("Uploading");
                },
                success: function(xhr, result, e) {
                    $('#transfers .file-list #tfile-'+id+' .nameandprogress').removeClass('active');
                    $('#transfers .file-list #tfile-'+id+' .file-upload-status').text("Done");
                    queue.start();
                },
                error: function(xhr, result, e) {
                    console.log("onError: " + result + " " + e);
                    $('#transfers .file-list #tfile-'+id+' .nameandprogress').removeClass('active').addClass('failed');
                    $('#transfers .file-list #tfile-'+id+' .file-upload-status').text("Failed");
                    queue.start();
                },
                processData: false
            });
        }
        this.remove = function() {

        }
        this.addToTransfersPage = function() {
            var template = _.template($('#fm-file-transferring').html());
            $('#transfers .file-list ul').append(template(this));
        }
    }
    function ChunkedFile(item, path) {
        this.item = item;
        this.path = path;
        this.id = 'unset';
        this.state = 0;
        this.startUpload = function() {

        }
        this.nextChunk = function() {

        }
        this.finishUpload = function() {

        }
        this.remove = function() {

        }
    }
    var qLen = 0;
    function UploadQueue() {
        this.queue = [];
        this.numToRunAtOnce = 1; // unused
        this.timer;
        this.genID = function() {
            return 'q-'+qLen;
        }
        this.start = function() {
            if (this.queue.length > 0) {
                console.log("File upload started");
                this.queue.shift().startUpload();
            } else {
                console.log("Upload queue finished");
                this.finish();
            }
        }
        this.finish = function() {
            console.log("File upload queue done");
        }
        this.add = function(file) {
            file.id = this.genID();
            console.log("Added file " + file.id + " to queue");
            file.addToTransfersPage();
            this.queue.push(file);
            var _this = this;
            clearTimeout(timer);
            timer = setTimeout(function() {
                _this.start();
            }, 100);
        }
        this.pause = function() {

        }
        this.empty = function() {

        }
    }

})(window.dd = window.dd || {}, jQuery);

/*
888     888       d8888 
888     888      d88888 
888     888     d88P888 
888     888    d88P 888 
888     888   d88P  888 
888     888  d88P   888 
Y88b. .d88P d8888888888 
 "Y88888P" d88P     888 
*/

(function(ua, $, undefined) {
    // http://stackoverflow.com/a/9851769/3605190

    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    ua.ua = '';

    if (isOpera) ua.ua = 'opera';
    if (isFirefox) ua.ua = 'firefox';
    if (isSafari) ua.ua = 'safari';
    if (isIE) ua.ua = 'ie';
    if (isEdge) ua.ua = 'edge';
    if (isChrome) ua.ua = 'chrome';

})(window.ua = window.ua || {}, jQuery);