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
        foxfile.routerbox.init();
    }
    foxfile.routerbox = {
        views: {},
        models: {},
        collections: {},
        content: null,
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
            this.content = $("#content");
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

        setTimeout(function() {
            $('.bar, .file-manager').css({
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
                var units = '';
                var size = '';
                if (this.size > 1000) {
                    if (this.size > 1000000) {
                        if (this.size > 1000000000) {
                            units = 'GB';
                            size = (this.size / 1000000000).toFixed(2);
                        } else {
                            units = 'MB';
                            size = (this.size / 1000000).toFixed(2);
                        }
                    } else {
                        units = 'KB';
                        size = (this.size / 1000).toFixed(2);
                    }
                }
                return size + " " + units;
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

})(window.dd = window.dd || {}, jQuery);