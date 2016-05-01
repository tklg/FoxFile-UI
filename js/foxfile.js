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
                //console.log("Preloading path: " + filePath);
                var loadQueue = filePath.split('/');
                if (loadQueue.length > 1) {
                    for (i = 1; i < loadQueue.length; i++) {
                        //console.log(loadQueue[i]);
                        fm.open(loadQueue[i]);
                    }
                }
            });
            this.router.on('route:openShared', function(filePath) {
                document.title = 'Shared - FoxFile';
                $('.pages #shared').addClass('active').css('z-index', 401).siblings().css('z-index', 400);
                $('.pages #shared').siblings().removeClass('active');
                fm.loadShared();
                //console.log("Switched to page shared");
            });
            this.router.on('route:openTrash', function(sort) {
                document.title = 'Trash - FoxFile';
                $('.pages #trash').addClass('active').css('z-index', 401).siblings().css('z-index', 400);
                $('.pages #trash').siblings().removeClass('active');
                fm.loadTrash();
                //console.log("Switched to page trash");
            });
            this.router.on('route:openTransfers', function(sort) {
                document.title = 'Transfers - FoxFile';
                $('.pages #transfers').addClass('active').css('z-index', 401).siblings().css('z-index', 400);
                $('.pages #transfers').siblings().removeClass('active');
                $('#transfers #badge-transfers').removeClass('new');
                fm.loadTransfers();
                //console.log("Switched to page transfers");
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
            page.updateFMToFitSize();
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
            //console.log("Active bar width should be " + activeBarWidth + "px");
            var barsActive = 0;
            while(barsActive * minWidth < (this.width - activeBarWidth)) {
                barsActive++;
            }
            barsActive-=2;
            this.numBarsCanBeActive = barsActive;
            fm.numBarsCanBeActive = this.numBarsCanBeActive;
            fm.barWidth = minWidth;
            fm.activeBarWidth = this.width - ((this.numBarsCanBeActive - 1) * minWidth);
            //console.log('Calculated '+barsActive+' bars active on this screen size ('+this.width+'px), each ' + fm.barWidth + "px wide");
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
            document.title = 'My Files - FoxFile';
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
    fm.wavesurfer = null;
    fm.hashToRestore = '';
    var hashTree = [];
    var fileTree = [];
    var currentFilePath = '';
    var width = 0;
    fm.btnStatus = {
        m1: false,
        m2: false,
        m3: false,
        shift: false,
        ctrl: false,
        scrollingTabs: false
    };
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
        var isRoot = false;
        if (hash == foxfile_root) isRoot = true;
        $.ajax({
            type: "POST",
            url: "./api/files/get_file_info",
            data: {
                hash: fHash
            },
            success: function(result) {

                var json = JSON.parse(result);
                //  console.log("fm.open("+fHash+") [1] Got response from server: ");
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
                if (isFolder) item = new FolderBar(name, hash, parent);
                else item = new FileBar(name, hash, parent);

                fm.add(item);
                item.refresh();

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
        // console.log("adding barItem: " + barItem.getHash());

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
        if (fileTree.length > 1) fileTree[fileTree.length - 2].setWidth(fm.barWidth);

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
            var ftl = fileTree.length - 1;
            for (i = _.indexOf(fileTree, barItem); i < ftl; i++) {
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
            document.title = "My Files - FoxFile";
        } else {
            fm.remove(fileTree[fileTree.length - 1]);
            var path = fm.calcFilePath();
            foxfile.routerbox.router.navigate('files/'+path, {/*trigger: true, */replace: true});
        }
        document.title = fileTree[fileTree.length - 1].name + " - FoxFile";
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
            //console.log("Moving file manager " + -1 * this.barWidth * (fileTree.length - this.numBarsCanBeActive) + 'px to the left (' + (fileTree.length - this.numBarsCanBeActive) + ' bars)');
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
            //console.log("window size: " + $(document).width());
            //console.log("Resizing file manager " + (this.width + (this.barWidth * (fileTree.length - this.numBarsCanBeActive))) + 'px');
        } else {
            $('.file-manager').css({
                'width': '100%'
            });
        }
    }
    fm.dialog = {
        dialog: null,
        dialogActive: false,
        Dialog: function(id, header, content, footer) {
            this.id = id;
            this.header = (header != null) ? '<header>'+header+'</header>' : '';
            this.content = (content != null) ? content : '';
            this.footer = footer || new DialogFooter();
            this.show = function() {
                var template = _.template($('#template-dialog').html());
                $('body').append(template(this));
                var _this = this;
                setTimeout(function() {
                    $('#'+_this.id+'.dialog-cover').addClass('active');
                    $('#'+_this.id+'.dialog-cover input').focus().select();
                }, 150);
            }
            this.hide = function() {
                $('#'+this.id+'.dialog-cover').addClass('removing').removeClass('active');
                var _this = this;
                setTimeout(function() {
                    $('#'+_this.id+'.dialog-cover').remove();
                }, 1000);
            }
        },
        DialogFooterOption: function(name, type, fn) {
            this.name = name;
            this.type = type;
            this.fn = fn;
        },
        DialogFooter: function() {
            this.opts = [];
            this.addOpt = function(opt) {
                this.opts.push(opt);
                return this;
            }
            this.opts2html = function() {
                var template = _.template($('#template-dialog-footer-opt').html());
                var res = '';
                for (i = 0; i < this.opts.length; i++) {
                    res += template(this.opts[i]);
                }
                return res;
            }
            this.html = function() {
                return this.opts2html();
            }
        },
        MiniBar: function(id) {

        },
        hideCurrentlyActive: function() {
            this.dialog.hide();
        },
        rename: {
            id: '',
            show: function(file, id) {
                this.id = id;
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Cancel', 'default', 'fm.dialog.rename.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Rename', 'default', 'fm.rename(\''+this.id+'\', $(\'#'+this.id+' .dialog input\').val())'));
                fm.dialog.dialog = new fm.dialog.Dialog(
                    id,
                    null,
                    '<input type="text" id="'+id+'" placeholder="Enter a name" value="'+file+'" autofocus />',
                    footer.html()
                );
                fm.dialog.dialog.show();
                cm.destroy();
                fm.dialog.dialogActive = true;
            },
            hide: function() {
                fm.dialog.dialog.hide();
                fm.dialog.dialogActive = false;
            }
        },
        delete: {
            id: '',
            show: function(file, id) {
                this.id = id;
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Cancel', 'default', 'fm.dialog.delete.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Delete', 'default', 'fm.delete(\''+this.id+'\')'));
                fm.dialog.dialog = new fm.dialog.Dialog(
                    this.id,
                    null,
                    '<p>Permanently delete <em>' + file + '</em> '+((fm.multiSelect.selected.length > 1) ? 'and '+(fm.multiSelect.selected.length - 1)+' other'+((fm.multiSelect.selected.length > 2)?'s':''):'')+'?</p>',
                    footer.html()
                );
                fm.dialog.dialog.show();
                cm.destroy();
                fm.dialog.dialogActive = true;
            },
            hide: function() {
                fm.dialog.dialog.hide();
                fm.dialog.dialogActive = false;
            }
        },
        trash: {
            id: '',
            show: function(file, id) {
                this.id = id;
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Cancel', 'default', 'fm.dialog.trash.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Delete', 'default', 'fm.trash(\''+this.id+'\')'));
                fm.dialog.dialog = new fm.dialog.Dialog(
                    this.id,
                    null,
                    '<p>Move <em>' + file + '</em> '+((fm.multiSelect.selected.length > 1) ? 'and '+(fm.multiSelect.selected.length - 1)+' other'+((fm.multiSelect.selected.length > 2)?'s':''):'')+' to the trash?</p>',
                    footer.html()
                );
                fm.dialog.dialog.show();
                cm.destroy();
                fm.dialog.dialogActive = true;
            },
            hide: function() {
                fm.dialog.dialog.hide();
                fm.dialog.dialogActive = false;
            }
        },
        newFolder: {
            id: '',
            show: function(file, id) {
                this.id = id;
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Cancel', 'default', 'fm.dialog.newFolder.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Create', 'default', 'fm.newFolder($(\'#'+this.id+' .dialog input\').val(),\''+this.id+'\')'));
                fm.dialog.dialog = new fm.dialog.Dialog(
                    this.id,
                    'Enter a name for the folder',
                    '<input type="text" id="'+id+'" placeholder="Folder name" value="" autofocus />',
                    footer.html()
                );
                fm.dialog.dialog.show();
                cm.destroy();
                fm.dialog.dialogActive = true;
            },
            hide: function() {
                fm.dialog.dialog.hide();
                fm.dialog.dialogActive = false;
            }
        },
        move: {
            show: function(file, id) {
                
            },
            hide: function() {
                
            }
        },
        share: {
            show: function(file, id) {
                this.id = id;
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Dismiss', 'default', 'fm.dialog.share.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Remove link', 'default', "fm.unshare(\'"+file+"\',\'"+id+"\')"));
                fm.dialog.dialog = new fm.dialog.Dialog(
                    this.id,
                    //'Share <em>'+file+'</em>',
                    null,
                    /*'<p>Enter the emails of people you want to share this with:</p>'
                    +'<input type="text" id="'+id+'" placeholder="Emails" value="" />'
                    +'<p>or make it accessible by everyone:</p>'
                    +'<input type="checkbox" id="'+id+'" '+(fm.isShared(id) ? 'checked':'')+' />'*/
                    '<p>Anyone with the link can download the file.</p>'
                    +'<input type="text" id="sharelink-'+id+'" placeholder="Fetching link..." value="" autofocus />',
                    footer.html()
                );
                fm.share(file, id);
                fm.dialog.dialog.show();
                cm.destroy();
                fm.dialog.dialogActive = true;
            },
            hide: function() {
                fm.dialog.dialog.hide();
                fm.dialog.dialogActive = false;
            }
        }
    }
    fm.snackbar = {
        nextID: 0,
        timer: null,
        queue: [],
        queueIsGoing: false,
        current: null,
        template: _.template($('#template-snackbar').html()),
        create: function(msg, action, fn) {
            this.queue.push(new this.Snackbar(msg, action, fn));
            var _this = this;
            setTimeout(function() {
                _this.startQueue();
            }, 300);
        },
        startQueue: function() {
            if (!this.queueIsGoing) {
                this.queueIsGoing = true;
                this.nextInQueue().show();
            }
        },
        nextInQueue: function() {
            if (this.queue.length == 0) {
                this.queueIsGoing = false;
                return null;
            }
            this.current = this.queue.shift();
            return this.current;
        },
        dismiss: function() {
            clearTimeout(this.current.timer);
            this.current.hide();
            setTimeout(function() {
                var n = fm.snackbar.nextInQueue();
                if (n)
                n.show();
            }, 500);
        },
        Snackbar: function(msg, action, fn) {
            this.id = fm.snackbar.nextID++;
            this.message = msg;
            this.action = action;
            this.fn = fn;
            this.timer = null;
            this.create = function() {
                $('body').append(fm.snackbar.template(this));
            }
            this.show = function() {
                $('#snackbar-'+this.id).addClass('active');
                var _this = this;
                _this.timer = setTimeout(function() {
                    _this.hide();
                    setTimeout(function() {
                        var n = fm.snackbar.nextInQueue();
                        if (n)
                        n.show();
                    }, 500);
                }, 4000);
            }
            this.hide = function() {
                $('#snackbar-'+this.id).removeClass('active');
                var _this = this;
                setTimeout(function() {
                    _this.destroy();
                }, 500);
            }
            this.destroy = function() {
                $('#snackbar-'+this.id).remove();
            }
            this.create();
        }
    }
    fm.multiSelect = {
        selected: [],
        dedup: function() {
            this.selected = _.uniq(this.selected);
        },
        add: function(hash) {
            this.selected.push(hash);
            this.dedup();
        },
        remove: function(hash) {
            this.selected = _.without(this.selected, hash);
        },
        contains: function(hash) {
            return _.contains(this.selected, hash);
        },
        clear: function() {
            var l = this.selected.length;
            for (i = 0; i < l; i++) {
                $('#cb-'+this.selected.shift()).prop('checked', false);
            }
        },
        get: function() {
            this.dedup();
            return this.selected;
        }
    }
    fm.multiTrash = {
        selected: [],
        dedup: function() {
            this.selected = _.uniq(this.selected);
        },
        add: function(hash) {
            this.selected.push(hash);
            this.dedup();
        },
        remove: function(hash) {
            this.selected = _.without(this.selected, hash);
        },
        contains: function(hash) {
            return _.contains(this.selected, hash);
        },
        clear: function() {
            var l = this.selected.length;
            for (i = 0; i < l; i++) {
                $('#cb-'+this.selected.shift()).prop('checked', false);
            }
        },
        get: function() {
            this.dedup();
            return this.selected;
        }
    }
    fm.refresh = function(hash) {
        console.log("refreshing bar " + hash);
        fm.getFromHash(hash).refresh(true);
        cm.destroy();
    }
    fm.refreshAll = function() {
        console.log("refreshing all open bars");
        for (i = 0; i < fileTree.length; i++) {
            fileTree[i].refresh(true);
        }
    }
    fm.rename = function(hash, name) {
        var parent = $('#file-'+hash+'.menubar-content').attr('parent');
        $.ajax({
            type: "POST",
            url: "./api/files/rename",
            data: {
                hash: hash,
                name: name
            },
            success: function(result) {
                var json = JSON.parse(result);
                fm.dialog.hideCurrentlyActive();
                fm.refresh(parent);
                fm.snackbar.create('Renamed ' + name);
            },
            error: function(request, error) {
                fm.dialog.hideCurrentlyActive();
                fm.snackbar.create("Failed to rename " + name);
            }
        });
    }
    fm.delete = function(hash) {
        if (fm.multiTrash.selected.length > 1) {
            hash = fm.multiTrash.selected;
        } else {
            hash = [hash];
        }
        var hashes = _.uniq(hash);
        var hashlist = hashes.toString();
        //files.unshare(file, id);
        var parent = $('#file-'+hashes[0]+'.menubar-content').attr('parent');
        $.ajax({
            type: "POST",
            url: "./api/files/delete",
            data: {
                hashlist: hashlist
            },
            success: function(result) {
                fm.dialog.hideCurrentlyActive();
                fm.loadTrash();
                fm.snackbar.create("Deleted file" + (fm.multiTrash.selected.length > 0 ? 's' : ''));
                fm.multiTrash.clear();
            },
            error: function(request, error) {
                fm.dialog.hideCurrentlyActive();
                fm.snackbar.create("Failed to delete file" + (fm.multiTrash.selected.length > 0 ? 's' : ''));
            }
        });
    }
    fm.trash = function(hash) {
        if (fm.multiSelect.selected.length > 1) {
            hash = fm.multiSelect.selected;
        } else {
            hash = [hash];
        }
        var hashes = _.uniq(hash);
        var hashlist = hashes.toString();
        //files.unshare(file, id);
        console.log(hashlist);
        var parent = $('#file-'+hashes[0]+'.menubar-content').attr('parent');
        $.ajax({
            type: "POST",
            url: "./api/files/trash",
            data: {
                hashlist: hashlist
            },
            success: function(result) {
                var json = JSON.parse(result);
                fm.dialog.hideCurrentlyActive();
                fm.refresh(parent);
                fm.snackbar.create("Moved file" + (fm.multiSelect.selected.length > 0 ? 's' : '') + " to the trash", "undo", "fm.snackbar.dismiss();fm.restore(fm.hashToRestore)");
                fm.hashToRestore = hashlist;
                fm.multiSelect.clear();
            },
            error: function(request, error) {
                fm.dialog.hideCurrentlyActive();
                fm.snackbar.create("Failed to move file" + (fm.multiSelect.selected.length > 0 ? 's' : '') + " to the trash");
            }
        });
    }
    fm.newFolder = function(name, parent) {
        if (name == "") {
            console.warn("Folder name cannot be blank.");
        } else {
            $.ajax({
                url: './api/files/new_folder',
                type: 'POST',
                data: {
                    name: name,
                    parent: parent
                },
                success: function(result, status, xhr) {
                    var json = JSON.parse(result);
                    fm.dialog.hideCurrentlyActive();
                    fm.refresh(parent);
                    fm.snackbar.create("Made new folder");
                },
                error: function(xhr, status, e) {
                    fm.dialog.hideCurrentlyActive();
                    fm.snackbar.create("Failed to make new folder");
                }
            });
        }
    }
    fm.download = function(id, name) {
        //this will definitely exist SOMEWHERE
        var type = $('.menubar-content[hash='+id+']').attr('type');
        if (type != 'folder') type = 'file';
        if (fm.multiSelect.selected.length > 1 || type == 'folder') {
            if (fm.multiSelect.selected.length > 1) {
                var hashes = _.uniq(fm.multiSelect.selected);
            } else {
                var hashes = [id];
            }
            var frame = $("<iframe></iframe>").attr('src', './api/files/download?hashlist='+hashes.toString()+"&name="+name+"&type="+type).attr('id', id).css('display', 'none');
            frame.appendTo('body');
            var _id = id;
            setTimeout(function() {
                $('body > iframe#'+_id).remove();
            }, 10000);
            fm.multiSelect.clear();
            fm.snackbar.create("Downloading files");
        } else {
            var frame = $("<iframe></iframe>").attr('src', './api/files/download?id='+id+"&name="+name).attr('id', id).css('display', 'none');
            frame.appendTo('body');
            var _id = id;
            setTimeout(function() {
                $('body > iframe#'+_id).remove();
            }, 10000);
            fm.snackbar.create("Download file");
        }
        cm.destroy();
    }
    fm.move = function(file, target) { //handles moving both single and multiple files
        if (fm.multiSelect.selected.length < 2) {
            if (!_.isArray(file)) { //if its a single thing
                var tmp = [file];
                file = tmp;
            }
        } else {
            file = fm.multiSelect.selected;
        }
        var hashes = _.uniq(file);
        var filesList = hashes.toString();
        $.ajax({
            url: './api/files/move',
            type: 'POST',
            data: {
                file_multi: filesList,
                file_target: target
            },
            success: function(result, status, xhr) {
                fm.refreshAll();
                fm.multiSelect.clear();
                fm.snackbar.create("Moved files");;
            },
            error: function(xhr, status, e) {
                fm.snackbar.create("Failed to move files");
            }
        });
        cm.destroy();
    }
    fm.share = function(file, id) {
        
    },
    fm.unshare = function(file, id) {
        
    }
    fm.loadTrash = function() {
        $('.pages .bar-trash').addClass('loading');
        $.ajax({
            type: "POST",
            url: "./api/files/list_trash",
            data: {
                offset: 0,
                limit: 30
            },
            success: function(result) {
                $('.pages .bar-trash').removeClass('loading');
                var json = JSON.parse(result);
                    // console.log("fm.open("+fHash+") [2] Got response from server: ");
                    // console.log(json);
                var hasMore = json['more'];
                var resultsRemaining = json['remaining'];
                var res = json['results'];
                var template = _.template($('#fm-file-trash').html());
                $('.pages .bar-trash .file-list').empty();
                if (res.length > 0) {
                    $.each(res, function(i) {
                        // name, parent, icon, hash, type, btype, size, lastmod, shared, public
                        var f = new File(res[i].name,
                                         res[i].parent,
                                         res[i].hash,
                                         res[i].is_folder,
                                         res[i].size,
                                         res[i].lastmod,
                                         res[i].is_shared,
                                         res[i].is_public);
                        $('.pages .bar-trash .file-list').append(template(f));
                    });
                } else {
                    var template = _.template($('#fm-trash-empty').html());
                    $('.pages .bar-trash .file-list').append(template({}));
                }
            },
            error: function(request, error) {
                //console.error(request, error);
            }
        });
    }
    fm.restore = function(hash) {
        cm.destroy();
        if (fm.multiSelect.selected.length > 1) {
            hash = fm.multiSelect.selected;
        } else {
            hash = [hash];
        }
        var hashes = _.uniq(hash);
        var hashlist = hashes.toString();
        $.ajax({
            type: "POST",
            url: "./api/files/restore",
            data: {
                hashlist: hashlist
            },
            success: function(result) {
                var json = JSON.parse(result);
                fm.refreshAll();
                fm.loadTrash();
                fm.snackbar.create("Restored file" +(fm.multiSelect.selected.length > 1 ? "s":''));
            },
            error: function(request, error) {
                fm.snackbar.create("Failed to restore file" +(fm.multiSelect.selected.length > 1 ? "s":''));
            }
        });
    }
    fm.loadShared = function() {
        $('.pages .bar-shared').addClass('loading');
        $.ajax({
            type: "POST",
            url: "./api/files/list_shared",
            data: {
                offset: 0,
                limit: 30
            },
            success: function(result) {
                $('.pages .bar-shared').removeClass('loading');
                var json = JSON.parse(result);
                    // console.log("fm.open("+fHash+") [2] Got response from server: ");
                    // console.log(json);
                var hasMore = json['more'];
                var resultsRemaining = json['remaining'];
                var res = json['results'];
                var template = _.template($('#fm-file').html());
                $('.pages .bar-shared .file-list').empty();
                if (res.length > 0) {
                    $.each(res, function(i) {
                        // name, parent, icon, hash, type, btype, size, lastmod, shared, public
                        var f = new File(res[i].name,
                                         res[i].parent,
                                         res[i].hash,
                                         res[i].is_folder,
                                         res[i].size,
                                         res[i].lastmod,
                                        res[i].is_shared,
                                         res[i].is_public);
                        $('.pages .bar-shared .file-list').append(template(f));
                    });
                } else {
                    var template = _.template($('#fm-share-empty').html());
                    $('.pages .bar-shared .file-list').append(template({}));
                }
            },
            error: function(request, error) {
                //console.error(request, error);
            }
        });
    }
    fm.isShared = function() {
        return false;
    }
    fm.loadTransfers = function() {
        if (dd.numFilesToDisplay == 0) {
            var template = _.template($('#fm-transfers-empty').html());
            $('.pages .bar-transfers .file-list').empty().addClass('empty');
            $('.pages .bar-transfers .file-list').append(template({}));
        }
    }
    fm.clearUploads = function() {
        dd.numFilesToDisplay = dd.numFilesToUpload;
        $('.bar-transfers .upload-success').remove();
        fm.snackbar.create("Emptied uploads list");
        fm.loadTransfers();
    }
    var FolderBar = function(name, hash, parent) {
        this.dd;
        this.name = name;
        this.hash = hash;
        this.parent = parent;
        this.hasMore = false;
        this.remaining = 0;
        this.offset = 0;
        this.limit = 30;
        this.files = []; // all files contained within this folder
        this.getName = function() {return this.name;}
        this.getHash = function() {return this.hash;}
        this.getParent = function() {return this.parent;}
        this.getFiles = function() {return this.files;}
        this.setFiles = function(fileGroup) {this.files = fileGroup;}
        this.refresh = function(fromstart) {
            if (fromstart) {
                this.offset = 0;
            }
            var _this = this;
            $('.file-manager .bar[hash='+_this.hash+']').addClass('loading');
            $.ajax({
                type: "POST",
                url: "./api/files/list_files",
                data: {
                    hash: _this.hash,
                    offset: _this.offset,
                    limit: _this.limit
                },
                success: function(result) {
                    var json = JSON.parse(result);
                        // console.log("fm.open("+fHash+") [2] Got response from server: ");
                        // console.log(json);
                    var hasMore = json['more'];
                    var resultsRemaining = json['remaining'];
                    var res = json['results'];
                    var files = [];
                    $.each(res, function(i) {
                        // name, parent, icon, hash, type, btype, size, lastmod, shared, public
                        files.push(new File(res[i].name,
                                            res[i].parent,
                                            res[i].hash,
                                            res[i].is_folder,
                                            res[i].size,
                                            res[i].lastmod,
                                            res[i].is_shared,
                                            res[i].is_public));
                    });
                    _this.setFiles(files);
                    _this.setRemaining(resultsRemaining);
                    _this.setHasMore(hasMore);

                    $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                    _this.loadContent();
                    dd.addListener(_this);
                    //fm.add(item);
                    // get the current file path so that the router can append this to it
                    var path = fm.calcFilePath()/* + dest*/;
                    foxfile.routerbox.router.navigate('files/'+path, {/*trigger: true, */replace: true});
                },
                error: function(request, error) {
                    //console.error(request, error);
                }
            });
        }
        this.loadContent = function() {
            // console.log("Loading bar " + this.hash + " content: " + this.files.length + " files");
            if (this.files.length > 0) {
                var template = _.template($('#fm-file').html());
                if (this.offset == 0)
                    $('#bar-'+this.hash+' .file-list').empty();
                for (i = 0; i < this.files.length; i++) {
                    $('#bar-'+this.hash+' .file-list').append(template(this.files[i]));
                    var _this = this;
                    var _i = i;
                    $("#bar-" + this.hash + " .file-list li[hash="+this.files[i].hash+"]").draggable({
                        opacity: 1,
                        helper: "clone",
                        revert: 'invalid',
                        cursorAt: {
                            top: 15,
                            left: 100
                        },
                        appendTo: 'body',
                        distance: 6,
                        scroll: false,
                        start: function(e, ui) {
                            $("li[hash="+_this.files[_i].hash+"]").css({
                                '-webkit-transition': 'none',
                                'transition': 'none'
                            });
                            if (fm.multiSelect.selected.length > 1) {
                                $(ui.helper).children('.file-name').text(fm.multiSelect.selected.length+" files");
                            }
                            //draggingFile = true;
                            //currentDraggingFolder = '';
                        },
                        stop: function(e, ui) {
                            $("li[hash="+_this.files[_i].hash+"]").css({
                                '-webkit-transition': 'all .15s ease-in-out',
                                'transition': 'all .15s ease-in-out'
                            });
                            //draggingFile = false;
                        }
                    });
                    if (this.files[i].type == 'folder') {
                        var _this = this.files[i];
                        $('#bar-' + this.hash + ' .file-list #folder-'+this.files[i].hash).droppable({
                            hoverClass: 'dragdrop-hover',
                            tolerance: 'pointer',
                            greedy: true,
                            drop: function(e, ui) {
                                if (fm.multiSelect.selected.length > 1) {
                                    hash = fm.multiSelect.selected;
                                } else {
                                    hash = [$(ui.helper).attr('hash')];
                                }
                                var hashes = _.uniq(hash);
                                var hashlist = hashes.toString();
                                var target = _this.hash;
                                if (_.contains(hashes, target))
                                    fm.snackbar.create("Cannot move a folder into itself");
                                else if ($('#bar-' + _this.parent + ' .file-list').children('[hash='+hashes[0]+']').length == 0)
                                    fm.move(hashlist, target);
                            }
                        });
                    }
                }
            } else {
                var template = _.template($('#fm-folder-empty').html());
                $('#bar-'+this.hash+' .file-list').empty();
                $('#bar-'+this.hash+' .file-list').append(template({}));
            }
            this.offset += this.limit;
            var _this = this;
            if (this.hasMore) {
                var onsc = _.debounce(function() {
                    if($('#bar-'+_this.hash+' .file-list').scrollTop() + $('#bar-'+_this.hash+' .file-list').height() > (40 * _this.offset) - 100) {
                       _this.refresh(false);
                    }
                }, 300);
                $('#bar-'+this.hash+' .file-list').on('scroll', function() {
                    onsc();
                });
            }
            $('#bar-' + this.hash + ' .file-list').droppable({
                hoverClass: 'dz-drag-hover',
                tolerance: 'pointer',
                drop: function(event, ui) {
                    if (fm.multiSelect.selected.length > 1) {
                        hash = fm.multiSelect.selected;
                    } else {
                        hash = [$(ui.helper).attr('hash')];
                    }
                    var hashes = _.uniq(hash);
                    var hashlist = hashes.toString();
                    var target = _this.hash;
                    if (_.contains(hashes, target))
                        fm.snackbar.create("Cannot move a folder into itself");
                    else if ($('#bar-' + _this.hash + ' .file-list').children('[hash='+hashes[0]+']').length == 0)
                        fm.move(hashlist, target);
                }
            });
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
        this.file = file;
        this.getName = function() {return this.name;}
        this.getHash = function() {return this.hash;}
        this.getParent = function() {return this.parent;}
        this.getType = function() {return this.file.type;}
        this.getBType = function() {return this.file.btype;}
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
        this.setType = function() {
            this.type = this.file.getType();
            //$('.bar#file-detail'+this.hash).attr('type', this.type);
            //console.log(this.type);
        }
        this.loadContent = function() {
            var template = _.template($('#fm-file-preview').html());
            var elem = '#file-detail-'+this.hash+' .file-preview';
            $(elem).empty();
            $(elem).append(template(this.file));

            var _this = this;
            if (this.file.btype == 'text') {
                $.ajax({
                    type: "GET",
                    url: "./api/files/view",
                    data: {
                        id: _this.file.hash
                    },
                    success: function(result) {
                        $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                        switch (_this.file.btype) {
                            case 'text':
                                //$(elem+" #editor").val(result);
                                te.init();
                                te.setValue(result, _this.name);
                                break;
                        }
                    },
                    error: function(request, error) {
                        //console.error(request, error);
                        $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                    }
                });
            } /*else if (this.file.btype == 'audio') {
                if (fm.wavesurfer != null) {
                    fm.wavesurfer.destroy();
                }
                fm.wavesurfer = WaveSurfer.create({
                    container: '#waveform',
                    waveColor: '#e1e1e1',
                    cursorColor: '#ff5722',
                    progressColor: '#ff5722'
                });
                fm.wavesurfer.load('./api/files/view?id='+this.file.hash);
                fm.wavesurfer.on('ready', function() {
                    $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                    fm.wavesurfer.play();
                });
                fm.wavesurfer.on('pause', function() {
                    $('.wavesurfer-controls #play').attr('onclick', 'fm.wavesurfer.play()').text('play');
                });
                fm.wavesurfer.on('play', function() {
                    $('.wavesurfer-controls #play').attr('onclick', 'fm.wavesurfer.pause()').text('pause');
                });
                fm.wavesurfer.on('stop', function() {
                    $('.wavesurfer-controls #play').attr('onclick', 'fm.wavesurfer.play()').text('play');
                });
            } */else {
                $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
            }
        }
        this.refresh = function() {
            item = new FileBar(name, hash, parent);
            var _this = this;
            $('.file-manager .bar[hash='+this.hash+']').addClass('loading');
            $.ajax({
                type: "POST",
                url: "./api/files/get_file",
                data: {
                    hash: _this.hash
                },
                success: function(result) {
                    var json = JSON.parse(result);
                    // console.log("fm.open("+fHash+") [2] Got response from server: ");
                    // console.log(json);
                    file = new File(json.name,
                            json.parent,
                            json.hash,
                            json.is_folder,
                            json.size,
                            json.lastmod,
                            json.is_shared,
                            json.is_public);
                    _this.setFile(file);
                    $('.file-manager .bar[hash='+_this.hash+']').attr({
                        'parent': file.parent,
                        'type': file.getType(),
                        'btype': file.getBType()
                    });
                    _this.setType();
                    _this.loadContent();

                    // get the current file path so that the router can append this to it
                    var path = fm.calcFilePath()/* + dest*/;
                    foxfile.routerbox.router.navigate('files/'+path, {/*trigger: true, */replace: true});
                },
                error: function(request, error) {
                    //console.error(request, error);
                }
            });
        }
    }
    var File = function(name, parent, hash, isFolder, size, lastmod, shared, public) {
        this.name = name;
        this.parent = parent;
        this.icon = icon;
        this.hash = hash;
        this.size = size;
        this.canPreview = isPreviewable(this);
        this.lastmod = new Date(lastmod);
        this.shared = shared == '0' ? false : true;
        this.public = public == '0' ? false : true;
        this.type = isFolder == '0' ? 'file' : 'folder';
        this.btype = this.type;
        this.getName = function() {return this.name;}
        this.getParent = function() {return this.parent;}
        this.getHash = function() {return this.hash;}
        this.getIcon = function() {
            return getIcon(this);
        }
        this.isFolder = function() {
            return this.type == 'folder';
        }
        this.getSize = function() {
            if (!this.isFolder()) {
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
               if (this.size == 0) return '0 Bytes';
               var i = parseInt(Math.log(this.size) / Math.log(1024));
               return (this.size / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
            } else return "&emsp;"; // folders do not display a size
        }
        this.getBType = function() {
            this.btype = getPreviewType(this);
            return this.btype;
        }
        this.getType = function() {
            this.type = getType(this);
            return this.type;
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
    $(document).on('click', '.file-manager .menubar-content:not(.btn-ctrlbar)', function(e) {
        e.stopPropagation();
        if($(e.target).parents('.file-multiselect-checkbox-container').length > 0) {
            //checkbox
        } else {
            var dest = $(this).attr('hash');
            if (fm.btnStatus.shift) {
                if (fm.multiSelect.contains(dest)) {
                    $(this).removeClass('selected');
                    fm.multiSelect.remove(dest);
                    $('#cb-'+dest).prop('checked', false);
                } else {
                    $(this).addClass('selected');
                    fm.multiSelect.add(dest);
                    $('#cb-'+dest).prop('checked', true);
                }
            } else {
                $(this).addClass('active').siblings().removeClass('active');
                fm.open(dest);
            }
        }
    });
    $(document).on('click', '.menubar-content .file-multiselect-checkbox-container .label', function(e) {
        e.stopPropagation();
        var hash = $(this).parents('.menubar-content').attr('hash');
        $(this).parents('.menubar-content').addClass('selected');
        fm.multiSelect.add(hash);
    });
    $(document).on('click', '.menubar-content .file-multiselect-checkbox-container .label-checked', function(e) {
        e.stopPropagation();
        var hash = $(this).parents('.menubar-content').attr('hash');
        $(this).parents('.menubar-content').removeClass('selected');
        fm.multiSelect.remove(hash);
    });
    $(document).on('click', '.file-manager .btn-back', function(e) {
        fm.back();
    });
    $(document).on('click', '.dialog', function(e) {
        e.stopPropagation();
    });
    $(document).on('click', '.dialog-cover', function(e) {
        fm.dialog.hideCurrentlyActive();
    });
    $(document).on("keydown", function(e) {
        if (e.which == 16) {
            fm.btnStatus.shift = true;
        }
    });
    $(document).on("keyup", function(e) {
        if (e.which == 16) {
            fm.btnStatus.shift = false;
        }
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
    var hovering = false;
    var queue;
    var linearQueue;
    dd.numFilesToUpload = 0;
    dd.numFilesToDisplay = 0;
    dd.ignoredFiles = [
        'desktop.ini',
        'Thumbs.db'
    ];
    dd.init = function() {
        console.info("Initialize dragdrop");
        droppedOn = foxfile_root;
        $('body').append('<input type="file" name="files[]" class="dd-input-hidden" id="dd-file-upload" multiple="" />');
        $('#dd-file-upload').on('change', function(e) {
            cm.destroy();
            fileDragDrop(e.originalEvent, this);
        });
        $('body').append('<input type="file" name="files[]" class="dd-input-hidden" id="dd-folder-upload" webkitdirectory directory multiple />');
        $('#dd-folder-upload').on('change', function(e) {
            cm.destroy();
            fileDragDrop(e.originalEvent, this);
        });
        queue = new TreeQueue();
        linearQueue = new LinearQueue();
        $('body').on('dragover dragenter', function(e) {
            if (!fm.isActive) {
                $('#files.btn-ctrlbar').addClass('active').siblings().removeClass('active');
                $('.pages').children().removeClass('active').css('z-index', 400);
                fm.isActive = true;
                var path = fm.calcFilePath();
                foxfile.routerbox.router.navigate('files/'+path, {replace: true});
            }
        });
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
        e.stopPropagation();
        e.preventDefault();
        //window.clearTimeout(timer);
        var hash = $(elem).attr('hash');
        var barItem;
        for (i = 0; i < fm.getHashTree().length; i++) {
            if (fm.getHashTree()[i] == hash) 
                barItem = fm.getFileTree()[i];
        }
        console.log("Hover entered bar " + barItem.getHash());
        $('#bar-'+hash).addClass('hovering');
        if (!internal) { // uploading a new file or folder  
            console.log('new');
        } else { // moving a file or folder
            console.log('move');
        }
    }
    function fileDragLeave(e, elem) {
        e.stopPropagation();
        e.preventDefault();
        //timer = window.setTimeout(function() {
            var hash = $(elem).attr('hash');
            var barItem;
            for (i = 0; i < fm.getHashTree().length; i++) {
                if (fm.getHashTree()[i] == hash) 
                    barItem = fm.getFileTree()[i];
            }
            console.log("Hover left bar " + barItem.getHash());
            $('#bar-'+barItem.getHash()).removeClass('hovering');
        //}, 25);
    }
    function fileDragDrop(e, elem) {
        console.log("Dropped a file on " + $(elem).attr('hash'));
        e.stopPropagation();
        e.preventDefault();
        var hash = $(elem).attr('hash');
        var parent;
        for (i = 0; i < fm.getHashTree().length; i++) {
            if (fm.getHashTree()[i] == hash) 
                parent = fm.getFileTree()[i];
        }
        $('#bar-'+parent.getHash()).removeClass('hovering');
        var nextAvailablePositionInQueue = queue.getNextPos();
        var tempFolder = new Folder(nextAvailablePositionInQueue, parent.getName(), parent.getHash(), parent.getParent(), true);
        tempFolder.hash = parent.getHash();
        //console.log("next available tree queue position: " + nextAvailablePositionInQueue);
        queue.add(tempFolder);

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
                        traverseFileTree(nextAvailablePositionInQueue, item, tempFolder);
                        }
                }
            }
        } else if (ua.ua == 'firefox' && e.dataTransfer) {
            try {
                for (var i = 0, m = e.dataTransfer.mozItemCount; i < m; ++i) {
                    var file = e.dataTransfer.mozGetDataAt("application/x-moz-file", i);
                    if (file instanceof Ci.nsIFile) {
                        traverseFileTree(nextAvailablePositionInQueue, new mozDirtyGetAsEntry(file), tempFolder);
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
            var items = e.dataTransfer.items;
            for (var i = 0; i < items.length; i++) {
                if (items[i].getAsEntry) {
                    var item = items[i].getAsEntry();
                        if (item) {
                        traverseFileTree(nextAvailablePositionInQueue, item, tempFolder);
                    }
                }
            }
        } else {
            console.log("Got files from file or folder input");
            cm.destroy();
            var filesList = [];
            for (var i = 0, file; file = files[i]; i++) {
                if (file.webkitRelativePath) {
                    file.path = String(file.webkitRelativePath).replace(RegExp("[\\/]" + String(file.name).replace(/([^\w])/g,'\\$1') + "$"), '') + "/";
                } else {
                    file.path = '';
                }
                if (!_.contains(dd.ignoredFiles, file.name)) {
                    filesList.push(file);
                }
            }
            //console.table(filesList);
            buildFileTree(nextAvailablePositionInQueue, filesList, tempFolder);

            //reset the inputs
            var c = $('#dd-file-upload');
            c.replaceWith(c = c.clone(true));
            var c = $('#dd-folder-upload');
            c.replaceWith(c = c.clone(true));    
        }
    }
    /* the file inputs need this because they dont fire the same events that drop does */
    /* and there is apparently a bug where the webkitEntry list is always empty. */
    /* this is a nonrecursive function to rebuild the file tree from the webkitRelativePath of the file */
    function buildFileTree(posInQueue, items, parent, path) {
        //console.table(items);
        var folderNamesSeen = [];
        var foldersAdded = [];
        var folders = [];
        var parents = [];
        for (var i = 0; i < items.length; i++) {
            var file = items[i];
            var path = file.path;
            if (path == '' && !_.contains(dd.ignoredFiles, file.name)) {
                //console.log("%cfound file to add: " + file.name + ", adding to " + parent.name, "color: green;");
                parent.addChild(new SmallFile(posInQueue, file, file.name, path, parent));
                queue.triggerStart(posInQueue);
                //folderNamesSeen.push('');
            } else {
                folderNamesSeen.push(path.split(/\//)[0]);
                //folders.push(file);
            }
        }
        folderNamesSeen = _.uniq(folderNamesSeen);
        for (var i = 0; i < folderNamesSeen.length; i++) {
            folders.push([]);
            for (var j = 0; j < items.length; j++) {
                if (folderNamesSeen[i] == items[j].path.split(/\//)[0]) {
                    //console.log(items[j].path);
                    var oPath = items[j].path;
                    var path = items[j].path.split(/\//);
                    var parentName = path.shift();
                    path = path.toString().replace(/,/g, '/');
                    items[j].path = path;
                    if (!_.contains(foldersAdded, parentName)) {
                        var newFolder = new Folder(posInQueue, parentName, oPath, parent, false);
                        parent.addChild(newFolder);
                        parents.push(newFolder);
                        foldersAdded.push(parentName);
                    }
                    folders[i].push(items[j]);
                }
            }
        }
        for (var i = 0; i < folders.length; i++) {
            buildFileTree(posInQueue, folders[i], parents[i]);
        }
    }
    /*
    @param item     the file item
    @param parent   the folder object, or the string hash of the root folder
    @param path     the path of the file item
    */
    function traverseFileTree(posInQueue, item, parent, path) {
        path = path || "";
        if (item.isFile) {
            item.file(function(file) {
                if (!_.contains(dd.ignoredFiles, file.name)) {
                    //console.log("%cfound file to add: " + file.name + ", adding to " + parent.name, "color: green;");
                    parent.addChild(new SmallFile(posInQueue, file, file.name, path, parent));
                    queue.triggerStart(posInQueue);
                }
            });
        } else if (item.isDirectory) {
            var dirReader = item.createReader();
            dirReader.readEntries(function(entries) {
                //console.log("%cfound folder to add: " + item.name + ", adding to " + parent.name, "color: orange;");
                var newFolder = new Folder(posInQueue, item.name, path + item.name + "/", parent, false);
                parent.addChild(newFolder);
                queue.triggerStart(posInQueue);
                for (i = 0; i < entries.length; i++) {
                    //traverseFileTree(entries[i], item.name, path + item.name + "/");
                    traverseFileTree(posInQueue, entries[i], newFolder, path + item.name + "/");
                }
            });
        }
    }
    function Folder(posInQueue, name, path, parent, sysf) {
        this.sysf = sysf;
        this.posInQueue = posInQueue;
        this.name = name;
        this.path = path;
        this.parent = parent;
        this.id = queue.getNextId();
        this.hash = null;
        this.children = [];
        this.state = 0;
        this.getSize = function() {
           return null;
        }
        this.getPath = function() {
            return this.path;
        }
        this.getName = function(includePath) {
            if (includePath) return this.path;
            else return this.name;
        }
        this.getType = function() {
            return 'Folder';
        }
        this.addChild = function(item) {
            this.children.push(item);
            //this.uploaded.push(false);
        }
        this.recursiveHash = function() {
            if (!this.sysf)
                if (this.hash == null) this.generateHash();

            // sort the list of children
            var tmp = [];
            for (i = 0; i < this.children.length; i++) 
                if (this.children[i] instanceof Folder) 
                    tmp.push(this.children[i]);
            for (i = 0; i < this.children.length; i++) 
                if (this.children[i] instanceof SmallFile)
                    tmp.push(this.children[i]);

            this.children = tmp;
            //console.log("Contents of folder ["+this.name+"]:");
            //console.table(this.children);
            
            //var i = 0; // APPARENTLY THIS IS REQUIRED TO MAKE IT NOT LOOP ENDLESSLY OR SKIP THINGS????
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] instanceof Folder)
                    this.children[i].recursiveHash();
                else 
                    this.children[i].generateHash();
            }
        }
        this.generateHash = function() {
            //console.log("Generating hash for FOLDER: " + this.name + " with parent " + this.parent.name);
            if (this.hash == null) {
                this.addToTransfersPage();
                var _this = this;
                $.ajax({
                    type: "POST",
                    url: "./api/files/uniqid",
                    success: function(result) {
                        var json = JSON.parse(result);
                        _this.hash = json.message;
                        queue.triggerDone(_this.posInQueue);
                        $('#transfers .file-list #tfile-'+_this.id).attr('hash', _this.hash);
                        //console.log("hash for " + _this.name+": "+json.response);
                    },
                    error: function(request, error) {
                        //console.error(request, error);
                    }
                });
            }
        }
        this.fakeUpload = function() {
            this.state = 1;
            var _this = this;
            $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').addClass('active');
            $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Uploading");
            setTimeout(function() {
                $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').removeClass('active');
                $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Done");
                $('#transfers #badge-transfers .badgeval').text(--dd.numFilesToUpload);    
                _this.state = 2;
                linearQueue.start(true);
            }, 400);
        }
        this.upload = function() {
            var _this = this;
            this.state = 1;
            $.ajax({
                url: './api/files/new_folder',
                type: 'POST',
                enctype: 'multipart/form-data',
                data: {
                    name: _this.name,
                    hash: _this.hash,
                    parent: _this.parent.hash
                },
                beforeSend: function() {
                    console.log(_this.name);
                    $('#transfers .file-list #tfile-'+_this.id).addClass('active');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Creating");
                },
                success: function(result, status, xhr) {
                    console.log("Upload success response: " + result);
                    //var json = JSON.parse(result);
                    $('#transfers .file-list #tfile-'+_this.id).removeClass('active').addClass('upload-success');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Done");
                    $('#transfers #badge-transfers .badgeval').text(--dd.numFilesToUpload);
                    /*var template = _.template($('#fm-file-basic').html());
                    $('#bar-'+_this.parent.hash+' .file-list').append(template(_this));*/
                    //refresh bar _this.parent.hash
                    _this.state = 2;
                    linearQueue.start();
                },
                error: function(xhr, status, e) {
                    console.log("onError: " + status + " " + e);
                    $('#transfers .file-list #tfile-'+_this.id).removeClass('active').addClass('upload-fail');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Failed");
                    _this.state = 3;
                    linearQueue.start();
                }
            });
        }
        this.addToTransfersPage = function() {
            var template = _.template($('#fm-file-transferring').html());
            if ($('#transfers .file-list').hasClass('empty')) {
                $('#transfers .file-list').empty().removeClass('empty');
                $('#transfers .file-list').append('<ul></ul>');
            }
            $('#transfers .file-list ul').append(template(this));
            $('#transfers #badge-transfers').addClass('new');
            $('#transfers #badge-transfers .badgeval').text(++dd.numFilesToUpload);
            dd.numFilesToDisplay++;
        }
        this.debug = function() {
            if (!this.sysf) {
                if (this.hash == null) this.generateHash();
            } else 
                console.log("This is a system folder (" + this.name + "), no hash will be generated");
            var tmp = [];
            for (i = 0; i < this.children.length; i++) if (this.children[i] instanceof Folder) tmp.push(this.children[i]);
            for (i = 0; i < this.children.length; i++) if (this.children[i] instanceof SmallFile) tmp.push(this.children[i]);
            this.children = tmp;
            console.log("Contents of folder ["+this.name+"]:");
            console.table(this.children);
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] instanceof Folder)
                    this.children[i].debug();
            }
        }
        this.addToLinearQueue = function() {
            if (!this.sysf) {
                linearQueue.add(this);
            } 
            var tmp = [];
            for (i = 0; i < this.children.length; i++) if (this.children[i] instanceof Folder) tmp.push(this.children[i]);
            for (i = 0; i < this.children.length; i++) if (this.children[i] instanceof SmallFile) tmp.push(this.children[i]);
            this.children = tmp;
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].addToLinearQueue();
            }
        }
    }
    function SmallFile(posInQueue, item, name, path, parent) {
        this.posInQueue = posInQueue;
        this.item = item;
        this.name = name;
        this.hash = null;
        this.parent = parent;
        this.path = path;
        this.id = queue.getNextId();
        this.state = 0;
        this.progress = 0;
        this.getSize = function() {
           var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
           if (this.item.size == 0) return '0 Bytes';
           var i = parseInt(Math.log(this.item.size) / Math.log(1024));
           return (this.item.size / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
        }
        this.getName = function(includePath) {
            if (includePath) 
                return this.path + this.item.name;
            else
                return this.name;
        }
        this.getType = function() {
            //return getType(this.item.name);
            return "File";
        }
        this.generateHash = function() {
            //console.log("Generating hash for FILE: " + this.name + " with parent " + this.parent.name);
            if (this.hash == null) {
                this.addToTransfersPage();
                var _this = this;
                $.ajax({
                    type: "POST",
                    url: "./api/files/uniqid",
                    success: function(result) {
                        var json = JSON.parse(result);
                        _this.hash = json.message;
                        queue.triggerDone(_this.posInQueue);
                        $('#transfers .file-list #tfile-'+_this.id).attr('hash', _this.hash);
                        //console.log("hash for " + _this.name+": "+json.response);
                    },
                    error: function(request, error) {
                        //console.error(request, error);
                    }
                });
            }
        }
        this.fakeUpload = function() {
            this.state = 1;
            var _this = this;
            $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').addClass('active');
            $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Uploading");
            setTimeout(function() {
                $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').removeClass('active');
                $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Done");
                $('#transfers #badge-transfers .badgeval').text(--dd.numFilesToUpload);    
                _this.state = 2;
                linearQueue.start(true);
            }, 600);
        }
        this.upload = function() {
            this.state = 1;
            var _this = this;
            var formData = new FormData();
            formData.append('file', this.item);
            formData.append('hash', this.hash);
            formData.append('parent', this.parent.hash);
            $.ajax({
                xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    //var xhr = new window.XMLHttpRequest();
                    var elem = $('#transfers .file-list #tfile-'+_this.id+' .file-upload-progress-bar');
                    if(xhr.upload){
                        xhr.upload.addEventListener('progress', function(e) {
                            if(e.lengthComputable) {
                                elem.css({
                                    width: ((e.loaded / e.total) * 100) + '%'
                                }).attr({value: e.loaded, max: e.total});
                            }
                        }, false);
                    }
                    return xhr;
                },
                type: 'POST',
                url: './api/files/new_file',
                data: formData,
                processData: false,
                contentType: false,
                beforeSend: function() {
                    $('#transfers .file-list #tfile-'+_this.id).addClass('active');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Uploading");
                },
                success: function(result, status, xhr) {
                    console.log("Upload success response: " + result);
                    //var json = JSON.parse(result);
                    $('#transfers .file-list #tfile-'+_this.id).removeClass('active').addClass('upload-success');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Done");
                    $('#transfers #badge-transfers .badgeval').text(--dd.numFilesToUpload);
                    /*var template = _.template($('#fm-file-basic').html());
                    $('#bar-'+_this.parent.hash+' .file-list').append(template(_this));*/
                    //refresh bar _this.parent.hash
                    _this.state = 2;
                    linearQueue.start();
                },
                error: function(xhr, status, e) {
                    console.log("onError: " + status + " " + e);
                    $('#transfers .file-list #tfile-'+_this.id).removeClass('active').addClass('upload-fail');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Failed");
                    _this.state = 3;
                    linearQueue.start();
                }
            });
        }
        this.remove = function() {

        }
        this.addToTransfersPage = function() {
            var template = _.template($('#fm-file-transferring').html());
            if ($('#transfers .file-list').hasClass('empty')) {
                $('#transfers .file-list').empty().removeClass('empty');
                $('#transfers .file-list').append('<ul></ul>');
            }
            $('#transfers .file-list ul').append(template(this));
            $('#transfers #badge-transfers').addClass('new');
            $('#transfers #badge-transfers .badgeval').text(++dd.numFilesToUpload);
            dd.numFilesToDisplay++;
        }
        this.addToLinearQueue = function() {
            linearQueue.add(this);
        }
    }
    function ChunkedFile(posInQueue, item, name, path, parent) {

    }
    function TreeItem(root) {
        this.root = root;
        this.started = false;
        this.done = false;
    }
    function TreeQueue() {
        this.trees = [];
        this.nextID = 0;
        this.startTimer;
        this.stopTimer;
        this.getNextPos = function() {
            return this.trees.length;
        }
        this.getNextId = function() {
            return this.nextID++;
        }
        this.add = function(tree) {
            //console.log('TreeQueue.add()');
            this.trees.push(new TreeItem(tree));
        }
        this.triggerStart = function(posInQueue) {
            var _this = this;
            if (this.startTimer) clearTimeout(this.startTimer);
            this.startTimer = null;
            this.startTimer = setTimeout(function() {
                _this.start(posInQueue);
            }, 500);
        }
        this.start = function(posInQueue) {
            if (!this.trees[posInQueue].started) { // not needed, because setTimeout SHOULD work
                console.log("%cStarting %cTree traversal of tree ["+posInQueue+"]", "color: green;font-weight:bold", "color: gray");
                this.trees[posInQueue].started = true;
                this.trees[posInQueue].root.recursiveHash();
            }
        }
        this.triggerDone = function(posInQueue) {
            var _this = this;
            if (this.stopTimer) clearTimeout(this.stopTimer);
            this.stopTimer = null;
            this.stopTimer = setTimeout(function() {
                _this.finish(posInQueue);
            }, 500);
        }
        this.finish = function(posInQueue) {
            console.log("%cFinishing %cTree traversal of tree ["+posInQueue+"]" , "color: red;font-weight:bold", "color: gray");
            this.trees[posInQueue].done = true;
            //this.trees[posInQueue].root.debug();
            this.trees[posInQueue].root.addToLinearQueue();
            //start uploading
            linearQueue.sort();
            //linearQueue.debug();
            //linearQueue.start(true);
            linearQueue.start();
        }
    }
    function LinearQueue() {
        this.trees = [];
        this.add = function(item) {
            this.trees.push(item);
        }
        this.sort = function() {
            var tmp = [];
            for (i = 0; i < this.trees.length; i++) 
                if (this.trees[i] instanceof Folder) tmp.push(this.trees[i]);
            for (i = 0; i < this.trees.length; i++) 
                if (this.trees[i] instanceof SmallFile) tmp.push(this.trees[i]);
            this.trees = tmp;
        }
        this.next = function() {
            return this.trees.shift();
        }
        this.start = function(fake) {
            if (this.trees.length == 0) {
                console.log("%cFinishing %cupload of LinearQueue","color:red","color:gray");
                fm.snackbar.create("Finished uploading files", 'view', '$(\'#transfers.btn-ctrlbar\').click()');
                fm.refreshAll();
            } else {
                if (fake) {
                    console.log("%cStarting %cfake upload of LinearQueue","color:green","color:gray");
                    this.next().fakeUpload();
                } else {
                    console.log("%cStarting %cupload of LinearQueue","color:green","color:gray");
                    this.next().upload();
                }
            }
        }
        this.clean = function() {
            for (var i = 0; i < this.trees.length; i++) {
                if (this.trees[i].state > 0) this.trees = _.without(this.trees, this.trees[i]);
            }
        }
        this.debug = function() {
            console.info("Linear queue contents:");
            console.table(this.trees);
        }
    }

})(window.dd = window.dd || {}, jQuery);

/*
   ____   ___       ___
  6MMMMb/ `MMb     dMM'
 8P    YM  MMM.   ,PMM 
6M      Y  M`Mb   d'MM 
MM         M YM. ,P MM 
MM         M `Mb d' MM 
MM         M  YM.P  MM 
MM         M  `Mb'  MM 
YM      6  M   YP   MM 
 8b    d9  M   `'   MM 
  YMMMM9  _M_      _MM_
*/

(function(cm, $, undefined) {
    this.menu = null;
    function ClickMenu(x, y) {
        this.x = x;
        this.y = y;
        this.width = 200;
        this.itemsCount = 0;
        this.create = function() {
            if (cm.menu != null) cm.destroy();
            var menuTemplate = _.template($('#contextmenu').html());
            $('body').append(menuTemplate());
            $('.clickmenu').css({
                'top': this.y - 40,
                'left': this.x - 40
            });
        }
        this.destroy = function() {
            $('.clickmenu').remove();
            cm.menu = null;
        }
        this.append = function(item) {
            $('.clickmenu ul').append(item);
        }
        this.create();
    }
    function MenuItem(parent, content, icon, fn, hint) {
        this.itemTemplate = _.template($('#menuitem').html());
        hint = hint || '';
        this.get = function() {
            return this.itemTemplate({id: parent.itemsCount++, content: content, icon: icon, fn: fn, kbsHint: hint});
        }
    }
    cm.destroy = function() {
        if (this.menu != null) {
            this.menu.destroy();
        }
    }
    $(document).on("contextmenu", ".file-manager .file-list:not(#bar-0 .file-list)", function(e) {
        e.stopPropagation();
        if (!fm.btnStatus.shift) {
            var parent = $(this).parents('.bar');
            e.preventDefault();
            //e.stopPropagation();
            cm.destroy();
            cm.menu = new ClickMenu(e.pageX, e.pageY);
            var menu = cm.menu;
            var hash = parent.attr('hash');
            var name = parent.attr('name');
            if (hash == foxfile_root) {
                cm.menu.append(new MenuItem(cm.menu, "Upload File", "upload", "$('#dd-file-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload Folder", "folder-upload", "$('#dd-folder-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "New Folder", "folder-plus", "fm.dialog.newFolder.show('"+name+"','"+hash+"')", "Alt+N").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+hash+"')", "Alt+R").get());
            } else {
                cm.menu.append(new MenuItem(cm.menu, "Rename", "rename-box", "fm.dialog.rename.show('"+name+"','"+hash+"')", "r or f2").get());
                cm.menu.append(new MenuItem(cm.menu, "Delete", "delete", "fm.dialog.trash.show('"+name+"','"+hash+"')", "Del").get());
                cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"','"+name+"')").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload File", "upload", "$('#dd-file-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload Folder", "folder-upload", "$('#dd-folder-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "New Folder", "folder-plus", "fm.dialog.newFolder.show('"+name+"','"+hash+"')", "Alt+N").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Get public link", "link", "fm.dialog.share.show('"+name+"','"+hash+"')", "L").get());
                cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+name+"','"+hash+"')", "m").get());
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+hash+"')", "Alt+R").get());
            }
        }
    });
    $(document).on("contextmenu", ".file-manager .menubar-content:not(.btn-ctrlbar)", function(e) {
        e.stopPropagation();
        if (!fm.btnStatus.shift) {
            var self = $(this);
            var hash = self.attr('hash');
            var parentHash = self.attr('parent');
            var name = self.attr('name');
            cm.destroy();
            cm.menu = new ClickMenu(e.pageX, e.pageY);
            var menu = cm.menu;
            if (self.attr('btype') == 'folder') {
                e.preventDefault();
                //e.stopPropagation();
                cm.menu.append(new MenuItem(cm.menu, "Rename", "rename-box", "fm.dialog.rename.show('"+name+"','"+hash+"')", "r or f2").get());
                cm.menu.append(new MenuItem(cm.menu, "Delete", "delete", "fm.dialog.trash.show('"+name+"','"+hash+"')", "Del").get());
                cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"','"+name+"')").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload File", "upload", "$('#dd-file-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload Folder", "folder-upload", "$('#dd-folder-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "New Folder", "folder-plus", "fm.dialog.newFolder.show('"+name+"','"+hash+"')", "Alt+N").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Get public link", "link", "fm.dialog.share.show('"+name+"','"+hash+"')", "L").get());
                cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+name+"','"+hash+"')", "m").get());
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+parentHash+"')", "Alt+R").get());
            } else if (self.attr('btype') == 'file') {
                e.preventDefault();
                //e.stopPropagation();
                cm.menu = new ClickMenu(e.pageX, e.pageY);
                cm.menu.append(new MenuItem(cm.menu, "Rename", "rename-box", "fm.dialog.rename.show('"+name+"','"+hash+"')", "r or f2").get());
                cm.menu.append(new MenuItem(cm.menu, "Delete", "delete", "fm.dialog.trash.show('"+name+"','"+hash+"')", "Del").get());
                cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"','"+name+"')").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Get public link", "link", "fm.dialog.share.show('"+name+"','"+hash+"')", "L").get());
                cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+name+"','"+hash+"')", "m").get());
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+parentHash+"')", "Alt+R").get());
            }
        }
    });
    $(document).on("click", ".file-manager .bar:not([id^='file-detail-']) .file-actions-header span", function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (!fm.btnStatus.shift) {
            var self = $(this).parents('.bar');
            var hash = self.attr('hash');
            var name = self.attr('name');
            cm.destroy();
            var menu = cm.menu;
            cm.menu = new ClickMenu(e.pageX - 180, 112);
            if (hash == foxfile_root) {
                cm.menu.append(new MenuItem(cm.menu, "Upload File", "upload", "$('#dd-file-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload Folder", "folder-upload", "$('#dd-folder-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "New Folder", "folder-plus", "fm.dialog.newFolder.show('"+name+"','"+hash+"')", "Alt+N").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+hash+"')", "Alt+R").get());
            } else {
                cm.menu.append(new MenuItem(cm.menu, "Rename", "rename-box", "fm.dialog.rename.show('"+name+"','"+hash+"')", "r or f2").get());
                cm.menu.append(new MenuItem(cm.menu, "Delete", "delete", "fm.dialog.trash.show('"+name+"','"+hash+"')", "Del").get());
                cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"','"+name+"')").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload File", "upload", "$('#dd-file-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload Folder", "folder-upload", "$('#dd-folder-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "New Folder", "folder-plus", "fm.dialog.newFolder.show('"+name+"','"+hash+"')", "Alt+N").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Get public link", "link", "fm.dialog.share.show('"+name+"','"+hash+"')", "L").get());
                cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+name+"','"+hash+"')", "m").get());
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+hash+"')", "Alt+R").get());
            }
        }
    });
    $(document).on("contextmenu", ".bar[id^='file-detail-']", function(e) {
        e.stopPropagation();
        if (!fm.btnStatus.shift && $(e.target).parents('.CodeMirror').length == 0) {
            var self = $(this);
            var hash = self.attr('hash');
            var parentHash = self.attr('parent');
            e.preventDefault();
            //e.stopPropagation();
            cm.destroy();
            cm.menu = new ClickMenu(e.pageX, e.pageY);
            cm.menu.append(new MenuItem(cm.menu, "Rename", "rename-box", "fm.dialog.rename.show('"+name+"','"+hash+"')", "r or f2").get());
            cm.menu.append(new MenuItem(cm.menu, "Delete", "delete", "fm.dialog.trash.show('"+hash+"')", "Del").get());
            cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"','"+name+"')").get());
            cm.menu.append('<hr class="nav-vert-divider">');
            cm.menu.append(new MenuItem(cm.menu, "Get public link", "link", "fm.dialog.share.show('"+name+"','"+hash+"')", "L").get());
            cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+name+"','"+hash+"')", "m").get());
            cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+parentHash+"')", "Alt+R").get());
        }
    });
    $(document).on("contextmenu", ".bar-trash .menubar-content", function(e) {
        e.stopPropagation();
        if (!fm.btnStatus.shift) {
            var self = $(this);
            var hash = self.attr('hash');
            var name = self.attr('name');
            e.preventDefault();
            //e.stopPropagation();
            cm.destroy();
            cm.menu = new ClickMenu(e.pageX, e.pageY);
            cm.menu.append(new MenuItem(cm.menu, "Restore", "backup-restore", "fm.restore('"+hash+"')").get());
            cm.menu.append(new MenuItem(cm.menu, "Delete forever", "delete-forever", "fm.dialog.delete.show('"+name+"','"+hash+"')", "Del").get());
            cm.menu.append('<hr class="nav-vert-divider">');
            cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.loadTrash()", "Alt+R").get());
        }
    });
    $(document).on('mousedown', function(e) {
        if (e.which != 3) {
            if ($(e.target).parents('.clickmenu').length < 1) {
                if (cm.menu != null) {
                    setTimeout(function() {
                        cm.menu.destroy();
                    }, 150)
                }
            }
        }
    });
})(window.cm = window.cm || {}, jQuery);
/*
88888888888 8888888888 
    888     888        
    888     888        
    888     8888888    
    888     888        
    888     888        
    888     888        
    888     8888888888 
*/
(function(te, $, undefined) {
    var editor = null;
    te.langsLoaded = [];
    te.init = function() {
        ied();
    }
    var ied = function(hash) {
        editor = CodeMirror.fromTextArea($('#editor')[0], {
            lineNumbers: true,
            lineWrapping: false,
            theme: 'foxfile-cm',
            indentUnit: 4,
            indentWithTabs: true,
            tabSize: 4,
            readOnly: true,
            keyMap: 'sublime',
            foldGutter: true,
            styleLineActive: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: {
                "Ctrl-S": function(instance) {
                    te.save();
                }
            }
        });
        CodeMirror.keyMap.sublime.Backspace = null;
        editor.on('focus', function() {
            //codemirrorActive = true;
        });
        editor.on('blur', function() {
            //codemirrorActive = false;
            //codemir.savecontent();
            te.save();
        });
        editor.on('keydown', function(instance, e) {
            //editor.showHint(instance);
            switch (e.which) {
                case 16: //shift
                case 17: //ctrl
                case 18: //alt
                case 27: //esc
                case 20: //caps
                case 112:case 113:case 114:case 115:case 116:case 117:case 118:case 119:case 120:case 121:case 122:case 123: //f1 - f12
                case 37:case 38:case 39: case 40: //arrow keys
                    //only do the thing below if the key is not one that does nothing
                    break;
                default:
                    /*tabs_list[active_tab].saved = false;
                    $('#'+active_tab+'.tab .editor-tab-status').text('save');*/
                    break;
            }
        });
        editor.on('cursorActivity', function(instance) {
            /*var object = instance.getCursor();
            $('.info .line-number #value').text(object.line + 1);
            $('.info .column-number #value').text(object.ch + 1);*/
        });
    }
    te.setLanguage = function(language) {
        if (language == 'null') return;
        if (!_.contains(te.langsLoaded, language)) {
            if (language == 'htmlmixed') { //because html has so many dependencies
                var _te = te;
                $.getScript('./js/cm-mode/xml/xml.js', function() {
                    _te.langsLoaded.push('xml');
                    $.getScript('./js/cm-mode/css/css.js', function() {
                        _te.langsLoaded.push('css');
                        $.getScript('./js/cm-mode/javascript/javascript.js', function() {
                            _te.langsLoaded.push('javascript');
                            $.getScript('./js/cm-mode/' + language + '/' + language + '.js', function() {
                                _te.langsLoaded.push(language);
                                editor.setOption("mode", language);
                                console.log('set language to ' + language);
                            });
                        });
                    });
                });
            } else {
                //console.log('js/cm-mode/' + language + '/' + language + '.js');
                $.getScript('./js/cm-mode/' + language + '/' + language + '.js', function() {
                    te.langsLoaded.push(language);
                    editor.setOption("mode", language);
                    console.log('set language to ' + language);
                });
            }
        } else {
            editor.setOption("mode", language);
            //console.log('set language to ' + language);
        }
    }
    te.setValue = function(data, name) {
        editor.setValue(data);
        te.setLanguage(CodeMirror.findModeByFileName(name).mode);
    }
    te.save = function() {

    }

})(window.te = window.te || {}, jQuery);



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