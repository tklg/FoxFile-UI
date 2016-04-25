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
                    '<p>Permanently delete <em>' + file + '</em> ?</p>',
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
                    '<p>Move <em>' + file + '</em> to the trash?</p>',
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
                //d.info(file+'<br>'+id);
                $('.modal-move').addClass('modal-active');
                if (multiSelect.numSelected < 2) {
                    $('.modal-move .modal-header #modal-header-name').text(file);
                } else {
                    $('.modal-move .modal-header #modal-header-name').text(file + " and " + (multiSelect.numSelected - 1) + " others");
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
        share: {
            show: function(file, id) {

            }, 
            hide: function() {

            }
        }
    }
    fm.snackbar = {

    }
    fm.multiSelect = {
        selected: [],
        dedup: function() {
            this.selected = _.uniq(this.selected);
        },
        add: function(hash) {
            this.selected.push(hash);
        },
        remove: function(hash) {
            this.selected = _.without(this.selected, hash);
        },
        clear: function() {
            this.selected = [];
        }
    }
    fm.refresh = function(hash) {
        console.log("refreshing bar " + hash);
        fm.getFromHash(hash).refresh();
        cm.destroy();
    }
    fm.refreshAll = function() {
        console.log("refreshing all open bars");
        for (i = 0; i < fileTree.length; i++) {
            fileTree[i].refresh();
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
            },
            error: function(request, error) {
                
            }
        });
    }
    fm.delete = function(hash) {
        if (fm.multiSelect.numSelected > 1) {
            hash = fm.multiSelect.selected;
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
                fm.multiSelect.clear();
            },
            error: function(request, error) {
                    
            }
        });
    }
    fm.trash = function(hash) {
        if (fm.multiSelect.numSelected > 1) {
            hash = fm.multiSelect.selected;
        } else {
            hash = [hash];
        }
        var hashes = _.uniq(hash);
        var hashlist = hashes.toString();
        //files.unshare(file, id);
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
                fm.multiSelect.clear();
            },
            error: function(request, error) {
                    
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
                    fm.multiSelect.clear();
                },
                error: function(xhr, status, e) {

                }
            });
        }
    }
    fm.move = function(file, target) { //handles moving both single and multiple files
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
    }
    fm.share = function(file, id) {
        $.post('dbquery.php',
        {
            modifyshared: 'yes',
            action: 'add',
            file: id
        },
        function(result) {
            if (result.includes('success')) {
                //d.info(result);
                var urla = window.location.href.toString().split('/');
                var url = '';
                for (i = 0; i < urla.length - 1; i++) {
                    url += urla[i] + '/';
                }
                //var key = location.hostname + '/foxfile/share?id=' + result.split("|-=-|")[1];
                var key = url + 'share?id=' + result.split("|-=-|")[1];
                $('.modal-share #modal-file-name-share').val(key).select();

                if (!result.includes("no new"))
                    bar.refreshAll();
                //$('.modal-share #modal-file-name-share').select();
            } else {
                d.error(result);
            }
        });
    },
    fm.unshare = function(file, id) {
        //d.warning(file + " " + id);
        $.post('dbquery.php',
        {
            modifyshared: 'yes',
            action: 'remove',
            file: id
        },
        function(result) {
            if (result.includes('success')) {
                $('.modal-share #modal-file-name-share').val("Link removed");
                //d.info(result);
                d.info("Unshared");
                bar.refreshAll();
                files.shareGUI.hide();
            } else {
                d.error(result);
            }
        });
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
                $.each(res, function(i) {
                    // name, parent, icon, hash, type, btype, size, lastmod, shared, public
                    var f = new File(res[i].name,
                                        res[i].parent,
                                        res[i].icon,
                                        res[i].hash,
                                        res[i].type,
                                        res[i].is_folder == '1' ? "folder" : "file",
                                        res[i].size,
                                        res[i].lastmod,
                                        res[i].is_shared,
                                        res[i].is_public);
                    $('.pages .bar-trash .file-list').append(template(f));
                });
            },
            error: function(request, error) {
                //console.error(request, error);
            }
        });
    }
    fm.restore = function(hash) {

    }
    fm.loadShared = function() {

    }
    var FolderBar = function(name, hash, parent) {
        this.dd;
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
        this.refresh = function() {
            var _this = this;
            $.ajax({
                type: "POST",
                url: "./api/files/list_files",
                data: {
                    hash: _this.hash,
                    offset: 0,
                    limit: 30
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
                                            res[i].icon,
                                            res[i].hash,
                                            res[i].type,
                                            res[i].is_folder == '1' ? "folder" : "file",
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
        this.setType = function() {
            this.type = this.file.getType();
            //$('.bar#file-detail'+this.hash).attr('type', this.type);
            //console.log(this.type);
        }
        this.loadContent = function() {
            // file preview
        }
        this.refresh = function() {
            item = new FileBar(name, hash, parent);
            var _this = this;
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
                            json.icon,
                            json.hash,
                            json.type,
                            json.size,
                            json.lastmod,
                            json.is_shared,
                            json.is_public);
                    _this.setFile(file);
                    _this.setType();

                    $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
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
    $(document).on('click', '.file-manager .menubar-content:not(.btn-ctrlbar)', function(e) {
        if($(e.target).parents('.file-multiselect-checkbox-container').length > 0) {
            //checkbox
        } else {
            var dest = $(this).attr('hash');
            $(this).addClass('active').siblings().removeClass('active');
            fm.open(dest);
        }
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
    dd.ignoredFiles = [
        'desktop.ini',
        'Thumbs.db'
    ];
    dd.init = function() {
        console.info("Initialize dragdrop");
        droppedOn = foxfile_root;
        $('body').append('<input type="file" class="dd-input-hidden" id="dd-file-upload" multiple="" />');
        $('#dd-file-upload').on('change', function(e) {
            cm.destroy();
            fileDragDrop(e.originalEvent, this);
        });
        $('body').append('<input type="file" class="dd-input-hidden" id="dd-folder-upload" webkitdirectory directory multiple />');
        $('#dd-folder-upload').on('change', function(e) {
            cm.destroy();
            fileDragDrop(e.originalEvent, this);
        });
        queue = new TreeQueue();
        linearQueue = new LinearQueue();
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
 
        if (elem instanceof HTMLInputElement) {

            var files = e.target.files;
            console.log(files);
            if (!files || files.length == 0) {
                console.log('input was empty');
                return false;
            }

            if (ua.ua == 'chrome') {
                console.log('starting tree traversal');
                for (var i = 0; i < files.length; i++) {
                    if (files[i].webkitGetAsEntry) {
                        var item = files[i].webkitGetAsEntry();
                        if (item) {
                            traverseFileTree(nextAvailablePositionInQueue, item, tempFolder);
                        }
                    }
                }
            } else if (ua.ua == 'firefox') {

            } else if (ua.ua == 'safari') {

            }


        } else {
            // console.log(e.dataTransfer);
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
            }
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
                    $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').addClass('active');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Creating");
                },
                success: function(result, status, xhr) {
                    console.log("Upload success response: " + result);
                    //var json = JSON.parse(result);
                    $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').removeClass('active');
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
                    $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').removeClass('active').addClass('failed');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Failed");
                    _this.state = 3;
                    linearQueue.start();
                }
            });
        }
        this.addToTransfersPage = function() {
            var template = _.template($('#fm-file-transferring').html());
            $('#transfers .file-list ul').append(template(this));
            $('#transfers #badge-transfers').addClass('new');
            $('#transfers #badge-transfers .badgeval').text(++dd.numFilesToUpload);
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
                    $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').addClass('active');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Uploading");
                },
                success: function(result, status, xhr) {
                    console.log("Upload success response: " + result);
                    //var json = JSON.parse(result);
                    $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').removeClass('active');
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
                    $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').removeClass('active').addClass('failed');
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
            $('#transfers .file-list ul').append(template(this));
            $('#transfers #badge-transfers').addClass('new');
            $('#transfers #badge-transfers .badgeval').text(++dd.numFilesToUpload);
        }
        this.addToLinearQueue = function() {
            linearQueue.add(this);
        }
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
            linearQueue.start();
            //linearQueue.clean();
            //linearQueue.debug();
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
            var parent = $(this).parent();
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
                cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"')").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload File", "upload", "$('#dd-file-upload').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload Folder", "folder-upload", "$('#dd-folder-upload').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "New Folder", "folder-plus", "fm.dialog.newFolder.show('"+name+"','"+hash+"')", "Alt+N").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Share", "share", "fm.dialog.share.show('"+hash+"')", ".").get());
                cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+hash+"')", "m").get());
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
                cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"')").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload File", "upload", "$('#dd-file-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload Folder", "folder-upload", "$('#dd-folder-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "New Folder", "folder-plus", "fm.dialog.newFolder.show('"+name+"','"+hash+"')", "Alt+N").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Share", "share", "fm.dialog.share.show('"+hash+"')", ".").get());
                cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+hash+"')", "m").get());
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+parentHash+"')", "Alt+R").get());
            } else if (self.attr('btype') == 'file') {
                e.preventDefault();
                //e.stopPropagation();
                cm.menu = new ClickMenu(e.pageX, e.pageY);
                cm.menu.append(new MenuItem(cm.menu, "Rename", "rename-box", "fm.dialog.rename.show('"+name+"','"+hash+"')", "r or f2").get());
                cm.menu.append(new MenuItem(cm.menu, "Delete", "delete", "fm.dialog.trash.show('"+name+"','"+hash+"')", "Del").get());
                cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"')").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Share", "share", "fm.dialog.share.show('"+hash+"')", ".").get());
                cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+hash+"')", "m").get());
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+parentHash+"')", "Alt+R").get());
            }
        }
    });
    $(document).on("contextmenu", ".bar[id^='file-detail-']", function(e) {
        e.stopPropagation();
        if (!fm.btnStatus.shift) {
            var self = $(this);
            var hash = self.attr('hash');
            var parentHash = self.attr('parent');
            e.preventDefault();
            //e.stopPropagation();
            cm.destroy();
            cm.menu = new ClickMenu(e.pageX, e.pageY);
            cm.menu.append(new MenuItem(cm.menu, "Rename", "rename-box", "fm.dialog.rename.show('"+name+"','"+hash+"')", "r or f2").get());
            cm.menu.append(new MenuItem(cm.menu, "Delete", "delete", "fm.dialog.trash.show('"+hash+"')", "Del").get());
            cm.menu.append(new MenuItem(cm.menu, "Download", "download", "fm.download('"+hash+"')").get());
            cm.menu.append('<hr class="nav-vert-divider">');
            cm.menu.append(new MenuItem(cm.menu, "Share", "share", "fm.dialog.share.show('"+hash+"')", ".").get());
            cm.menu.append(new MenuItem(cm.menu, "Move", "folder-move", "fm.dialog.move.show('"+hash+"')", "m").get());
            cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+parentHash+"')", "Alt+R").get());
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