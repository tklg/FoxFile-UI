// http://code.tutsplus.com/tutorials/single-page-todo-application-with-backbonejs--cms-21417
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
    }
    var page = {
        width: $(window).width(),
        numBarsCanBeActive: 1,
        views: {},
        models: {},
        collections: {},
        content: null,
        router: null,
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
        changeContent: function(el) {
            this.content.empty().append(el);
            return this;
        },
        setTitle: function(str) {
            return $('title').text(str);
        }
    }
    
    var ViewsFactory = {};
    var Router = Backbone.Router.extend({});
    page.router = new Router();

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
    	//change href hash for backbone route
    	$(this).addClass('active').siblings().removeClass('active');
    	if (this.id == 'files') {
    		$('.pages').children().removeClass('active').css('z-index', 400);
    	} else {
    		var elem = this;
    		$('.pages #' + this.id).addClass('active').css('z-index', 401).siblings().css('z-index', 400);
    		setTimeout(function() {
    			$('.pages #' + elem.id).siblings().removeClass('active');
    		}, 500);
    	}
    	console.log("Switched to page " + this.id);
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
    fm.numBarsCanBeActive = 1;
    fm.barWidth = 280;
    fm.activeBarWidth = 560;
    fm.last = null;
    var fileTree = [];
    var width = 0;
    fm.init = function() {
        console.info("Initialize FileManager");
        this.width = $(window).width();
        $('#bar-0').css({
            'width': fm.barWidth + 'px'
        });
        fm.open(foxfile_root, '', 'My files', 'folder');
        fm.open('fsnj43njn3l4jnrl3kn4r3rnjkl3nrl3', '59d2646254895816400fcb1eded7d86d', 'Subfolder 1', 'folder');
        fm.open('nj43nrlj3njk4n3lr3ljrn3lnr3krnln', 'fsnj43njn3l4jnrl3kn4r3rnjkl3nrl3', 'Subfolder 2', 'folder');
        //fm.open('n5lt4j5nnl56k4jn564klnl3kn6j3lnk', 'nj43nrlj3njk4n3lr3ljrn3lnr3krnln', 'Subfolder 3', 'folder');
        //fm.open('3bk45b34b5kjbh2klkj41m2lk32k4n2s', 'n5lt4j5nnl56k4jn564klnl3kn6j3lnk', 'Subfolder 4', 'folder');
    }
    fm.getLast = function() {
        fm.last = fileTree[fileTree.length - 1];
        return fm.last;
    }
    fm.open = function(hash, parent, name, type) {
        var item = null;
        var fHash = hash;
        if (type == 'folder') {
            item = new FolderBar(name, hash, parent);
        } else if (type == 'file') {
            item = new FileBar(name, hash, parent);
        } else {
            console.warn("Tried to call fm.open() with illegal argument type=\""+type+"\"");
            return;
        }
        $.ajax({
            type: "POST",
            url: "./api/file/open",
            data: {
                hash: fHash
            },
            success: function(result) {
                var res = JSON.parse(result);
                console.log("fm.open("+fHash+") Got response from server: ");
                console.log(res);
                var resType = res['type'];
                var res = res['content'];
                if (resType == 'folder') {
                    var files = [];
                    $.each(json, function(i) {
                        files.push(new File(json[i].name, json[i].parent, json[i].icon, json[i].hash, json[i].type, json[i].size, json[i].lastmod_date, json[i].lastmod_time, json[i].shared));
                    });
                    item.setFiles(files);
                    fm.add(item);
                } else { // is file

                }
                if (fm.getLast() == null) {
                    fm.add(item);
                } else {
                    if (fm.getLast().getHash() == fHash) {
                        fm.replaceLast(item);
                    } else {
                        fm.add(item);
                    }
                }
            },
            error: function(request, error) {
                console.error(request, error);
            }
        });
    }
    fm.replaceLast = function(barItem) {
        if (barItem instanceof FolderBar) {

        } else if (barItem instanceof FileBar) {

        } else {
            console.warn("Tried to call fm.replace(barItem) with illegal argument \"" + barItem + "\"");
            return;
        }
    }
    fm.add = function(barItem) {
        for (i = 0; i < fileTree.length; i++) {
            if (fileTree[i].getHash() == barItem.getHash()) {
                fileTree[i] = barItem;
                break;
            }
        }
        fileTree.push(barItem);

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
        if (fileTree.length > 1) fileTree[fileTree.length - 2].setWidth(fm.barWidth);
        //barItem.setWidth(fm.activeBarWidth);
        barItem.moveTo(fileTree.length);
        barItem.loadContent();
        fm.moveToFitCurrentlyActive();
        fm.resizeToFitCurrentlyActive();
    }
    fm.remove = function(hash) {

    }
    fm.moveToFitCurrentlyActive = function() {
        if (fileTree.length > this.numBarsCanBeActive) {
            $('.file-manager').css({
                'left': -1 * this.barWidth * (fileTree.length - this.numBarsCanBeActive) + 'px'
            });
            console.log("Moving file manager " + -1 * this.barWidth * (fileTree.length - this.numBarsCanBeActive) + 'px to the left (' + (fileTree.length - this.numBarsCanBeActive) + ' bars)');
        }
    }
    fm.resizeToFitCurrentlyActive = function() {
        if (fileTree.length > this.numBarsCanBeActive) {
            $('.file-manager').css({
                'width': this.width + (this.barWidth * (fileTree.length - this.numBarsCanBeActive)) + 'px'
            });
            console.log("Resizing file manager " + (this.width + (this.barWidth * (fileTree.length - this.numBarsCanBeActive))) + 'px');
        }
    }
    var FolderBar = function(name, hash, parent) {
        this.name = name;
        this.hash = hash;
        this.parent = parent;
        this.files = []; // all files contained within this folder
        this.getName = function() {return this.name;}
        this.getHash = function() {return this.hash;}
        this.getParent = function() {return this.parent;}
        this.getFiles = function() {return this.files;}
        this.setFiles = function(fileGroup) {this.files = fileGroup;}
        this.loadContent = function() {
            console.log("Loading bar " + this.hash + " content: " + this.files.length + " files");
            var template = _.template($('#fm-file').html());
            for (i = 0; i < this.files.length; i++) {
                $('#bar-'+this.hash+' .file-list').append(template(this.files[i]));
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
    }
    var FileBar = function(name, hash, parent, type, jsonData) {
        this.name = name;
        this.hash = hash;
        this.parent = parent;
        this.type = type;
        this.jsonData = jsonData;
        this.getName = function() {return this.name;}
        this.getHash = function() {return this.hash;}
        this.getParent = function() {return this.parent;}
        this.getType = function() {return this.type;}
        this.getJsonData = function() {return this.jsonData;}
    }
    var File = function(name, parent, icon, hash, type, size, lastmod_date, lastmod_time, shared) {
        this.name = name;
        this.icon = icon;
        this.hash = hash;
        this.type = type;
        this.size = size;
        this.lastmod_date = lastmod_date;
        this.lastmod_time = lastmod_time;
        this.shared = shared;
        this.getName = function() {return this.name;}
        this.getHash = function() {return this.hash;}
        this.getIcon = function() {return this.icon;}
        this.getType = function() {return this.type;}
        this.getSize = function() {return this.size;}
        this.getLastmod = function() {return [this.lastmod_date, this.lastmod_time];}
        this.getShared = function() {return this.shared;}
    }
})(window.fm = window.fm || {}, jQuery);