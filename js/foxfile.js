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
    https://tkluge.net
*/

(function(foxfile, $, undefined) {
    foxfile.init = function(){
        if (localStorage.getItem('theme'))
            if (localStorage.getItem('theme') == 'night')
                $('body').addClass('foxfile-dark');
        page.init(function() {
            fm.init();
            dd.init();
            foxfile.routerbox.init();
        });
    }
    foxfile.logout = function() {
        localStorage.removeItem('api_key');
        document.location.href = './logout';
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
                    "transfers": "openTransfers",
                    "search": "openSearch"
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
            this.router.on('route:openSearch', function(sort) {
                document.title = 'Search - FoxFile';
                //fm.loadSearch();
            });
            Backbone.history.start();
        }
    }
    var page = {
        width: $(window).width(),
        numBarsCanBeActive: 1,
        init: function(done) {
            console.info("Initialize page");
            $.ajax({
                type: "POST",
                url: "./api/users/info",
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                success: function(result, s, x) {
                    //console.log(result);
                    json = JSON.parse(result);
                    $('[fetch-data=user-first]').text(json['firstname']);
                    $('[fetch-data=user-name]').text(json['username']);
                    $('[fetch-data=user-email]').text(json['email']);
                    $('[fetch-data=user-gravatar]').attr('src', '//gravatar.com/avatar/'+json['md5']+'?d=retro&r=r');
                    foxfile_root = json['root'];
                    //localStorage.setItem('privkey', cr.aesD(json['privkey'], localStorage.getItem('basekey')));
                    localStorage.setItem('privkey', json['privkey']);
                    localStorage.setItem('pubkey', json['pubkey']);

                    page.calculateBars();
                    fm.updateSize();
                    fm.resizeToFitCurrentlyActive();
                    fm.moveToFitCurrentlyActive();
                    if (done) done(); // dunnnnnn
                },
                error: function(request, error) {
                    if (request.status == 404) {
                        fm.snackbar.create('Auth key is invalid','logout','document.location.href=\'./login\'');
                        setTimeout(function() {
                            document.location.href = './login';
                        }, 3000);
                    }
                }
            });
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
            $('.pages > section').css('width', this.width - fm.barWidth);
            //console.log('Calculated '+barsActive+' bars active on this screen size ('+this.width+'px), each ' + fm.barWidth + "px wide");
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

    var rightnav = {
        isOpen: false,
    	toggle: function() {
            $('#nav-right').toggleClass('active');
            this.isOpen = !this.isOpen;
        }
    }
    $(document).on('click', '.btn-ctrlbar', function(e) {
    	$(this).addClass('active').siblings().removeClass('active');
        if ($(this).attr('id') == 'files') {
            document.title = 'My Files - FoxFile';
            $('.pages').children().removeClass('active').css('z-index', 400);
            $('.pages .bar').removeClass('float-3');
            if (fm.searching) {
                fm.searching = false;
                fm.isActive = true;
                fm.clearTrees();
                $('.file-manager .bar:not(#bar-0)').remove();
                fm.open(foxfile_root);
                var path = fm.calcFilePath();
                foxfile.routerbox.router.navigate('files/'+path, {replace: true});
                return;
            } else if (fm.isActive) { // switch to root
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
            if (fm.getHashTree().length > 1)
                $('.pages .bar').addClass('float-3');
        }
    });
    $(document).on('click', '.user-menu, .nav-right-active-cover, #nav-right .closeOnClick', function(e) {
    	console.log("Toggling right nav");
    	rightnav.toggle();
    });
    var pageInit = _.debounce(page.init, 200);
    $(window).resize(function() {
        pageInit();
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
    fm.searching = false;
    fm.simultaneousUploads = 3;
    fm.simultaneousDownloads = 3;
    /*fm.uploadSizeLimit = 2097152; //2MB, php default
    fm.uploadChunkSize = 2097152;*/
    fm.uploadSizeLimit = 1048576; //1MB, because base64 encoded aes
    fm.uploadChunkSize = 1048576;
    var hashTree = [];
    var fileTree = [];
    var currentFilePath = '';
    var width = 0;
    fm.btnStatus = {
        m1: false,
        m2: false,
        m3: false,
        shift: false,
        ctrl: false
    };
    fm.init = function() {
        console.info("Initialize FileManager");
        fm.updateSize();

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
        fm.fetchQuota();
    }
    fm.cbyte = function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
    fm.updateSize = function() {
        //console.info("Resize FileManager");
        this.width = $(window).width();
        $('#bar-0').css({
            'width': fm.barWidth + 'px'
        });
    }
    fm.clearTrees = function() {
        hashTree = [];
        fileTree = [];
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
            headers: {
                'X-Foxfile-Auth': api_key
            },
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
        //console.log("adding barItem: " + barItem.getHash() + ' ' + barItem.getParent());

        document.title = barItem.name + " - FoxFile";

        if (barItem.getParent() == hashTree[hashTree.length - 2]) { // opening a file from the same folder;
            console.log("remove last");
            fm.remove(fm.getLast());
        } else if (_.indexOf(hashTree, barItem.getParent()) < (hashTree.length - 2)) {
            console.log('remove rest');
            var ind = _.indexOf(hashTree, barItem.getParent());
            if (fm.searching && hashTree.length <= 2) {
                ind = _.indexOf(hashTree, 'search');
            }
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
        //console.log(barItem);
        if (barItem.getHash() == fm.getLast().getHash()) { // removing the last one
            //console.log("removing last ("+fm.getLast().getHash()+")");
            $('.file-manager .bar[hash='+fileTree.pop().getHash()+']').remove();
            hashTree.pop();
        } else {
            //console.log("removing all after ("+fm.getLast().getHash()+"), inclusive");
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
    fm.removeRoot = function() {
        hashTree = [];
        fileTree = [];
        $('.file-manager .bar:not(#bar-0)').remove();
        document.title = 'FoxFile';
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
                'left': -1 * this.barWidth * (fileTree.length - this.numBarsCanBeActive) - 2 + 'px'
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
        minibar: null,
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
        MiniBar: function() {
            var template = _.template($('#template-dialog-minibar').html());
            var hashTree = [];
            var nameTree = [];
            //var folderTree = [];
            this.limit = 30;
            this.offset = 0;
            this.load = function(hash, name, noadd) {
                $('.minibar .file-list').addClass('loading');
                /*for (var i = 0; i < folderTree.length; i++) {
                    var name = name;
                    if (folderTree[i].hash == hash) 
                        name = folderTree[i].name;
                }*/
                if (!noadd) {
                    hashTree.push(hash);
                    hashTree = _.uniq(hashTree);
                    nameTree.push(name);
                }
                $('.minibar #minibar-name').text(name);
                var _this = this;
                $.ajax({
                    type: "POST",
                    url: "./api/files/list_folders",
                    headers: {
                        'X-Foxfile-Auth': api_key
                    },
                    data: {
                        hash: hash,
                        offset: _this.offset,
                        limit: _this.limit
                    },
                    success: function(result) {
                        $('.minibar').removeClass('loading');
                        $('#minibar-target').attr('cdir', hash);
                        var json = JSON.parse(result);
                            // console.log("fm.open("+fHash+") [2] Got response from server: ");
                            // console.log(json);
                        var hasMore = json['more'];
                        var resultsRemaining = json['remaining'];
                        var res = json['results'];
                        $('.minibar .file-list').empty();
                        if (res.length > 0) {
                            $.each(res, function(i) {
                                var f = new fm.dialog.MiniBarItem(res[i].name,
                                            res[i].hash);
                                $('.minibar .file-list').append(f.template(f));
                                //folderTree.push(f);
                            });
                        } else {
                            var template = _.template($('#template-dialog-minibar-item').html());
                            $('.minibar .file-list').append(template({name:'Folder is empty',hash:hash,fn:''}));
                        }
                    },
                    error: function(request, error) {
                        fm.snackbar.create("Failed to load folders");
                    }
                });
            }
            this.back = function() {
                if (hashTree.length > 1) {
                    hashTree.pop();
                    nameTree.pop();
                    this.load(hashTree[hashTree.length - 1], nameTree[nameTree.length - 1], true);
                }
            }
            this.html = function() {
                var res = template(this);
                return res;
            }
        },
        MiniBarItem: function(name, hash) {
            this.template = _.template($('#template-dialog-minibar-item').html());
            this.name = name;
            this.hash = hash;
            this.fn = 'fm.dialog.minibar.load(\''+hash+'\',\''+name+'\')';
        },
        hideCurrentlyActive: function() {
            if (this.dialog)
                this.dialog.hide();
        },
        rename: {
            id: '',
            show: function(file, id) {
                this.id = id;
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Cancel', 'default', 'fm.dialog.rename.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Rename', 'submit', 'fm.rename(\''+this.id+'\', $(\'#'+this.id+' .dialog input\').val())'));
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
                footer.addOpt(new fm.dialog.DialogFooterOption('Delete', 'submit', 'fm.delete(\''+this.id+'\')'));
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
        emptyTrash: {
            id: '',
            show: function() {
                this.id = 'emptytrash';
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Cancel', 'default', 'fm.dialog.emptyTrash.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Delete', 'submit', 'fm.delete(\''+this.id+'\')'));
                fm.dialog.dialog = new fm.dialog.Dialog(
                    this.id,
                    null,
                    '<p>Empty the trash bin?</p>',
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
                footer.addOpt(new fm.dialog.DialogFooterOption('Delete', 'submit', 'fm.trash(\''+this.id+'\')'));
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
                footer.addOpt(new fm.dialog.DialogFooterOption('Create', 'submit', 'fm.newFolder($(\'#'+this.id+' .dialog input\').val(),\''+this.id+'\')'));
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
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Cancel', 'default', 'fm.dialog.move.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Move', 'submit', 'fm.move(\''+id+'\',$(\'#minibar-target\').attr(\'cdir\'))'));
                fm.dialog.minibar = new fm.dialog.MiniBar();
                fm.dialog.dialog = new fm.dialog.Dialog(
                    id,
                    null,
                    fm.dialog.minibar.html(),
                    footer.html()
                );
                fm.dialog.minibar.load(foxfile_root, 'My Files');
                fm.dialog.dialog.show();
                cm.destroy();
                fm.dialog.dialogActive = true;
            },
            hide: function() {
                fm.dialog.dialog.hide();
                fm.dialog.dialogActive = false;
            }
        },
        share: {
            show: function(file, id) {
                this.id = id;
                var footer = new fm.dialog.DialogFooter();
                footer.addOpt(new fm.dialog.DialogFooterOption('Dismiss', 'default', 'fm.dialog.share.hide()'));
                footer.addOpt(new fm.dialog.DialogFooterOption('Remove link', 'submit', "fm.unshare(\'"+file+"\',\'"+id+"\')"));
                fm.dialog.dialog = new fm.dialog.Dialog(
                    this.id,
                    //'Share <em>'+file+'</em>',
                    null,
                    /*'<p>Enter the emails of people you want to share this with:</p>'
                    +'<input type="text" id="'+id+'" placeholder="Emails" value="" />'
                    +'<p>or make it accessible by everyone:</p>'
                    +'<input type="checkbox" id="'+id+'" '+(fm.isShared(id) ? 'checked':'')+' />'*/
                    '<p>Anyone with the link and the key can download this file. Send them separately if possible.</p>'
                    +'<label for="sharelink">Link</label><input type="text" class="sharelink" id="sharelink" placeholder="Fetching link..." readonly autofocus />'
                    +'<label for="sharekey">Key</label><input type="text" class="sharekey" id="sharekey" placeholder="Fetching key..." readonly />'
                    +'<p>You can also combine the link with the key:</p>'
                    +'<!--<label for="sharelinkkey">Link &amp; key</label>--><input type="text" class="sharelinkkey" id="sharelinkkey" placeholder="Fetching link..." readonly />',
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
        fm.getFromHash(hash).refresh(true);
        cm.destroy();
    }
    fm.refreshAll = function() {
        for (i = 0; i < fileTree.length; i++) {
            fileTree[i].refresh(true);
        }
    }
    fm.rename = function(hash, name) {
        var parent = $('#file-'+hash+'.menubar-content').attr('parent');
        $.ajax({
            type: "POST",
            url: "./api/files/rename",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hash: hash,
                name: name
            },
            success: function(result) {
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
        if (fm.multiTrash.selected.length > 0) {
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
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hashlist: hashlist
            },
            success: function(result) {
                fm.dialog.hideCurrentlyActive();
                fm.loadTrash();
                fm.snackbar.create("Deleted file" + (fm.multiTrash.selected.length > 1 ? 's' : ''));
                fm.multiTrash.clear();
                fm.fetchQuota();
            },
            error: function(request, error) {
                fm.dialog.hideCurrentlyActive();
                fm.snackbar.create("Failed to delete file" + (fm.multiTrash.selected.length > 1 ? 's' : ''));
            }
        });
    }
    fm.emptyTrash = function() {
        var elem = $('.bar-trash .file-list li .file-multiselect-checkbox-container input');
        elem.click();
        elem.each(function(i) {
            fm.multiTrash.add($(this).attr('id').split('-')[1]);
        });
        fm.dialog.emptyTrash.show();
    }
    fm.restoreTrash = function() {
        var elem = $('.bar-trash .file-list li .file-multiselect-checkbox-container input');
        elem.click();
        elem.each(function(i) {
            fm.multiTrash.add($(this).attr('id').split('-')[1]);
        });
        fm.restore('restoretrash');
    }
    fm.trash = function(hash) {
        if (fm.multiSelect.selected.length > 0) {
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
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hashlist: hashlist
            },
            success: function(result) {
                fm.dialog.hideCurrentlyActive();
                fm.refresh(parent);
                fm.snackbar.create("Moved file" + (fm.multiSelect.selected.length > 1 ? 's' : '') + " to the trash", "undo", "fm.snackbar.dismiss();fm.restore(fm.hashToRestore)");
                fm.hashToRestore = hashlist;
                fm.multiSelect.clear();
            },
            error: function(request, error) {
                fm.dialog.hideCurrentlyActive();
                fm.snackbar.create("Failed to move file" + (fm.multiSelect.selected.length > 1 ? 's' : '') + " to the trash");
            }
        });
    }
    fm.newFolder = function(name, parent) {
        if (name == "") {
            console.warn("Folder name cannot be blank.");
        } else {
            var pass = forge.util.encode64(cr.randomBytes());
            $.ajax({
                url: './api/files/new_folder',
                type: 'POST',
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: {
                    //name: cr.aesES(name, pass),
                    name: name,
                    parent: parent,
                    key: cr.aesES(pass, localStorage.getItem('basekey'))
                },
                success: function(result, status, xhr) {
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
        if (fm.multiSelect.selected.length > 0) {
            var hashes = _.uniq(fm.multiSelect.selected);
        } else {
            var hashes = [id];
        }
        dl.start((fm.multiSelect.selected.length > 1 || type == 'folder'), hashes);
        /*if (fm.multiSelect.selected.length > 1 || type == 'folder') {
            var frame = $("<iframe></iframe>").attr('src', './api/files/download?api_key='+api_key+'&hashlist='+hashes.toString()+"&name="+name+"&type="+type).attr('id', id).css('display', 'none');
            frame.appendTo('body');
            var _id = id;
            setTimeout(function() {
                $('body > iframe#'+_id).remove();
            }, 10000);
            fm.multiSelect.clear();
            fm.snackbar.create("Downloading files");
        } else {
            var frame = $("<iframe></iframe>").attr('src', './api/files/download?api_key='+api_key+'&id='+id+"&name="+name).attr('id', id).css('display', 'none');
            frame.appendTo('body');
            var _id = id;
            setTimeout(function() {
                $('body > iframe#'+_id).remove();
            }, 10000);
            fm.snackbar.create("Downloading file");
        }*/
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
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                file_multi: filesList,
                file_target: target
            },
            success: function(result, status, xhr) {
                fm.dialog.hideCurrentlyActive();
                fm.refreshAll();
                fm.multiSelect.clear();
                fm.snackbar.create("Moved file" +(fm.multiSelect.selected.length > 1 ? "s":''));
            },
            error: function(xhr, status, e) {
                fm.dialog.hideCurrentlyActive();
                fm.snackbar.create("Failed to move file" +(fm.multiSelect.selected.length > 1 ? "s":''));
            }
        });
        cm.destroy();
    }
    fm.share = function(file, id) {
        $.ajax({
            url: './api/files/make_public',
            type: 'POST',
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hash: id
            },
            success: function(result, status, xhr) {
                var json = JSON.parse(result);
                var link = json.hash;
                var key = json.enckey;
                var urla = window.location.href.toString().split('browse');
                var url = urla[0];
                //url += link;
                url += 'share/'+link;
                $('.dialog article .sharelink').val(url).focus().select();
                var worker = ww.create('crypto');
                worker.emit('aes.decrypt', {
                    content: key,
                    key: localStorage.getItem('basekey')
                });
                worker.onmessage = function(msg) {

                    $('.dialog article .sharekey').val(forge.util.bytesToHex(atob(msg[1].data)));
                    $('.dialog article .sharelinkkey').val(url+'.'+forge.util.bytesToHex(atob(msg[1].data)));
                    $('.dialog article input#sharelink').focus().select();
                    worker.emit('close', {
                        content: 'pls'
                    });

                    /*console.log(msg[1].data);
                    worker.emit('rsa.encrypt', {
                        content: msg[1].data
                    });
                    worker.onmessage = function(msg) {
                        $('.dialog article .sharekey').val(forge.util.bytesToHex(atob(msg[1].data)));

                        worker.emit('close', {
                            content: 'pls'
                        });
                    }*/
                }
                fm.refreshAll();
            },
            error: function(xhr, status, e) {
                fm.dialog.hideCurrentlyActive();
                if (xhr.status == 401)
                    fm.snackbar.create("Verify your email to share files", 'my account', 'document.location.href=\'account\'');
                else
                    fm.snackbar.create("Failed to share file");
            }
        });
    }
    fm.unshare = function(file, id) {
        $.ajax({
            url: './api/files/make_public',
            type: 'POST',
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                remove: id
            },
            success: function(result, status, xhr) {
                $('.dialog article .sharelink').val("Link removed");
                $('.dialog article .sharelinkkey').val("Link removed");
                $('.dialog article .sharekey').val("Key removed");
                fm.refreshAll();
            },
            error: function(xhr, status, e) {
                fm.dialog.hideCurrentlyActive();
                fm.snackbar.create("Failed to unshare file");
            }
        });
    }
    fm.loadTrash = function() {
        $('.pages .bar-trash').addClass('loading');
        $.ajax({
            type: "POST",
            url: "./api/files/list_trash",
            headers: {
                'X-Foxfile-Auth': api_key
            },
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
                                         res[i].enckey,
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
        if (fm.multiTrash.selected.length > 0) {
            hash = fm.multiTrash.selected;
        } else {
            hash = [hash];
        }
        var hashes = _.uniq(hash);
        var hashlist = hashes.toString();
        $.ajax({
            type: "POST",
            url: "./api/files/restore",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hashlist: hashlist
            },
            success: function(result) {
                fm.refreshAll();
                fm.loadTrash();
                fm.snackbar.create("Restored file" +(fm.multiTrash.selected.length > 1 ? "s":''));
            },
            error: function(request, error) {
                fm.snackbar.create("Failed to restore file" +(fm.multiTrash.selected.length > 1 ? "s":''));
            }
        });
    }
    fm.loadShared = function() {
        $('.pages .bar-shared').addClass('loading');
        $.ajax({
            type: "POST",
            url: "./api/files/list_shared",
            headers: {
                'X-Foxfile-Auth': api_key
            },
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
                                         res[i].enckey,
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
    fm.toggleInfoView = function(hash, isFile) {
        if (isFile != false) { //yes this is necessary
            $('#file-detail-'+hash+' .file-preview, #file-detail-'+hash+' .file-history').toggleClass('active');
            $('#fpvtoggle i').toggleClass('mdi-information-outline mdi-eye');
            if ($('#file-detail-'+hash+' .file-preview').hasClass('active')) {
                $('#fpvtoggle').attr('title', 'Information');
            } else {
                $('#fpvtoggle').attr('title', 'Preview');
            }
        } else {
            cm.destroy();
            $('#bar-'+hash).toggleClass('viewdetails');
        }
    }
    fm.touchFile = function(hash) {
        $.ajax({
            type: "POST",
            url: "./api/files/touch", //add touch() to the stuff this does to fix the downloading problem
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hash: hash
            },
            success: function(result) {
                fm.snackbar.create("Set new current version");
                fm.refreshAll();
            },
            error: function(r, e) {

            }
        });
    }
    fm.deleteVersion = function(hash) {
        $.ajax({
            type: "POST",
            url: "./api/files/delete_single",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hash: hash
            },
            success: function(result) {
                fm.snackbar.create("Version removed");
                fm.refreshAll();
            },
            error: function(r, e) {
                fm.snackbar.create("Failed to delete file");
            }
        });
    }
    var srch = function(name) {
        if (name == '') {
            fm.searching = false;
            fm.isActive = true;
            fm.clearTrees();
            $('.file-manager .bar:not(#bar-0)').remove();
            fm.open(foxfile_root);
            var path = fm.calcFilePath();
            foxfile.routerbox.router.navigate('files/'+path, {replace: true});
            $('.btn-ctrlbar#files').addClass('active');
            return;
        }
        $('#bar-search').addClass('loading');
        if (!fm.searching) {
            $('.btn-ctrlbar').removeClass('active');
            $('.pages').children().removeClass('active').css('z-index', 400);
            foxfile.routerbox.router.navigate('search', {replace: true});
            fm.clearTrees();
            $('.file-manager .bar:not(#bar-0)').remove();
            openSearchFolder();
            fm.isActive = false;
            fm.searching = true;
        }
        $.ajax({
            type: "POST",
            url: "./api/files/search",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                name: name
            },
            success: function(result) {
                updateSearchBar(JSON.parse(result));
            },
            error: function(request, error) {
                fm.snackbar.create("Failed to load seach results for \"" + name+"\"");
            }
        });
    }
    fm.search = _.debounce(srch, 500);
    var openSearchFolder = function() {
        //possibly do something like this for the other 2 or 3 bars
        var item = new FolderBar('Search', 'search', 'root');
        fm.add(item);
    }
    var updateSearchBar = function(res) {
        var sb = fm.getFileTree()[0];
        var files = [];
        $.each(res, function(i) {
            // name, parent, icon, hash, type, btype, size, lastmod, shared, public
            files.push(new File(res[i].name,
                res[i].parent,
                res[i].hash,
                res[i].enckey,
                res[i].is_folder,
                res[i].size,
                res[i].lastmod,
                res[i].is_shared,
                res[i].is_public,
                res[i].is_trashed));
        });
        sb.setFiles(files);
        sb.loadContent();
        sb.offset = 0;
        dd.addListener(sb);
        $('#bar-search').removeClass('loading');
    }
    fm.fetchQuota = function() {
        $.ajax({
            type: "POST",
            url: "./api/users/account",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                part: 'quota'
            },
            success: function(result) {
                var json = JSON.parse(result);
                var total = json['total'];
                var used = json['files'];
                var qu = Math.round(used / total * 100);
                var str = qu + "% of " + fm.cbyte(total) + " used";
                $('#badge-quota').text(str);
            },
            error: function(request, error) {
                $('#badge-quota').text(' ');
            }
        });
    }
    var FolderBar = function(name, hash, parent) {
        this.dd;
        this.name = name.addSlashes();
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
        this.setFiles = function(fileGroup) {
            //$.merge(this.files, fileGroup);
            this.files = fileGroup;
        }
        this.refresh = function(fromstart) {
            if (fromstart) {
                this.offset = 0;
            }
            var _this = this;
            $('.file-manager .bar[hash='+_this.hash+']').addClass('loading');
            $.ajax({
                type: "POST",
                url: "./api/files/list_files",
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: {
                    hash: _this.hash,
                    offset: _this.offset,
                    limit: _this.limit
                },
                success: function(result) {
                    var json = JSON.parse(result);
                        // console.log("fm.open("+fHash+") [2] Got response from server: ");
                    var total = json['total_rows'];
                    var hasMore = json['more'];
                    var resultsRemaining = json['remaining'];
                    var res = json['results'];
                    var files = [];
                    $.each(res, function(i) {
                        // name, parent, icon, hash, type, btype, size, lastmod, shared, public
                        files.push(new File(res[i].name,
                                            res[i].parent,
                                            res[i].hash,
                                            res[i].enckey,
                                            res[i].is_folder,
                                            res[i].size,
                                            res[i].lastmod,
                                            res[i].is_shared,
                                            res[i].is_public,
                                            res[i].is_trashed));
                    });
                    _this.setFiles(files);
                    _this.setRemaining(resultsRemaining);
                    _this.setHasMore(hasMore);

                    $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                    _this.loadContent(files.length == 0);
                    dd.addListener(_this);
                    //fm.add(item);
                    // get the current file path so that the router can append this to it
                    var path = fm.calcFilePath()/* + dest*/;
                    foxfile.routerbox.router.navigate('files/'+path, {/*trigger: true, */replace: true});
                },
                error: function(request, error) {
                    console.error(request, error);
                }
            });
        }
        this.loadContent = function(empty) {
            //console.log("Loading bar " + this.hash + " content: " + this.files.length + " files");
            if (this.files.length > 0 && !empty) {
                var template = _.template($('#fm-file').html());
                //console.log('offset: '+this.offset);
                if (this.offset == 0) {
                    $('#bar-'+this.hash+' .file-list').empty();
                }
                for (var i = 0; i < this.files.length; i++) {
                    $('#bar-'+this.hash+' .file-list').append(template(this.files[i]));
                    var _this = this;
                    var _i = i;
                    var targetHash = this.files[i].hash;
                    $("#bar-" + this.hash + " .file-list li[hash="+targetHash+"]").draggable({
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
                            $("li[hash="+targetHash+"]").css({
                                '-webkit-transition': 'none',
                                'transition': 'none'
                            });
                            if (fm.multiSelect.selected.length > 0) {
                                $(ui.helper).children('.file-name').text(fm.multiSelect.selected.length+" files");
                            }
                            //draggingFile = true;
                            //currentDraggingFolder = '';
                        },
                        stop: function(e, ui) {
                            $("li[hash="+targetHash+"]").css({
                                '-webkit-transition': 'all .15s ease-in-out',
                                'transition': 'all .15s ease-in-out'
                            });
                            //draggingFile = false;
                        }
                    });
                    if (this.files[i].type == 'folder') {
                        dd.addSmallListener(this.files[i]);
                        $(".file-list li[hash="+targetHash+"]").droppable({
                            hoverClass: 'hovering',
                            tolerance: 'pointer',
                            greedy: true,
                            drop: function(e, ui) {
                                e.stopPropagation();
                                e.preventDefault();
                                var target = $(this).attr('hash');
                                console.log("#bar-" + _this.hash + " .file-list li[hash="+target+"]");
                                if (fm.multiSelect.selected.length > 0) {
                                    hash = fm.multiSelect.selected;
                                } else {
                                    hash = [$(ui.draggable).attr('hash')];
                                }
                                var hashes = _.uniq(hash);
                                var hashlist = hashes.toString();
                                console.log(hashlist, target);
                                if (_.contains(hashes, target))
                                    fm.snackbar.create("Cannot move a folder into itself");
                                else if ($('#bar-' + _this.parent + ' .file-list').children('[hash='+hashes[0]+']').length == 0)
                                    fm.move(hashlist, target);
                            }
                        });
                    }
                }
            } else {
                var template;
                if (this.hash == 'search') {
                    template = _.template($('#fm-search-empty').html());
                } else {
                    template = _.template($('#fm-folder-empty').html());
                }
                $('#bar-'+this.hash+' .file-list').empty();
                $('#bar-'+this.hash+' .file-list').append(template({}));
            }
            var _this = this;
            this.offset += this.limit;
            if (this.hasMore) {
                var onsc = _.debounce(function() {
                    if($('#bar-'+_this.hash+' .file-list').scrollTop() + $('#bar-'+_this.hash+' .file-list').height() > (40 * _this.offset) - 200) {
                       _this.refresh(false);
                    }
                }, 700);
                $('#bar-'+this.hash+' .file-list').unbind('scroll');
                $('#bar-'+this.hash+' .file-list').on('scroll', function() {
                    onsc();
                });
            }
            if (this.hash != 'search') {
                $('#bar-' + this.hash + ' .file-list').droppable({
                    tolerance: 'pointer',
                    over: function(e, ui) {
                        if ($('#bar-'+_this.hash+' .file-list').children('li.hovering').length == 0) {
                            $('#bar-'+_this.hash).addClass('hovering');
                        }
                    },
                    out: function(e, ui) {
                        $('#bar-'+_this.hash).removeClass('hovering');
                    },
                    drop: function(event, ui) {
                        $('#bar-'+_this.hash).removeClass('hovering');
                        if (fm.multiSelect.selected.length > 0) {
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
        }
        this.setWidth = function(size) {
            //console.log("Sizing bar " + this.hash + " to " + size + 'px');
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
        this.name = name.addSlashes();
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
            this.file.key = api_key;
            $(elem).append(template(this.file));

            template = _.template($('#fm-file-history').html());
            elem = '#file-detail-'+this.hash+' .file-history';
            $(elem).empty();
            $(elem).append(template(this.file));

            var _this = this;
            if (this.file.canPreview) {
                $.ajax({
                    type: "POST",
                    url: "./api/files/view",
                    headers: {
                        'X-Foxfile-Auth': api_key
                    },
                    data: {
                        id: _this.file.hash
                    },
                    success: function(data, response, xhr) {
                        var worker = ww.create('crypto');
                        //var key = cr.aesD(xhr.getResponseHeader('X-FoxFile-Key'), localStorage.getItem('basekey'));
                        //console.log(data);
                        //var data = btoa(data);
                        //var data = btoa(forge.util.hexToBytes(CryptoJS.enc.Hex.stringify(CryptoJS.enc.u8array.parse(data))));

                        //var data = CryptoJS.enc.Base64.stringify(CryptoJS.enc.u8array.parse(data));
                        
                        // transfer back to raw bytes on server to save space
                        worker.emit('aes.decrypt', {
                            content: xhr.getResponseHeader('X-FoxFile-Key'),
                            key: localStorage.getItem('basekey')
                        });
                        worker.onmessage = function(msg) {
                            var key = msg[1].data;
                            /*var iv = data.substr(0,cr.ivLength);
                            console.log(iv);
                            var chunks = cr.chunkString(data.substr(cr.ivLength));*/
                            var chunks = cr.chunkString(data);
                            delete data;
                            var cl = chunks.length;
                            /*console.log(xhr.getResponseHeader('X-FoxFile-Key'));;
                            console.log('data: '+data);
                            console.log('key: '+ key);*/
                            console.log('processing '+cl+' chunks');
                            var i = 0;
                            function process() {
                                //console.log('starting chunk '+i+' of '+cl);
                                if (i < cl) {
                                    worker.emit('aes.decrypt.process', {
                                        content: chunks.shift(),
                                        key: key/*,
                                        iv: iv*/
                                    });
                                }
                            }
                            process();
                            worker.onmessage = function(msg) {
                                //console.log('buffer size: '+msg[1].data);
                                if (++i < cl) {
                                    process();
                                } else {
                                    console.log('finishing');
                                    worker.emit('aes.decrypt.finalize');
                                    worker.onmessage = function(msg) {   
                                        //console.log('got '+cr.chunkString(msg[1].data).length+' chunks');
                                        worker.emit('close');
                                        $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                                        $('.file-manager .bar[hash='+_this.hash+'] .file-decrypting-icon').removeClass('active').next().addClass('active');
                                        //console.log(msg[1].data);
                                        switch (_this.file.btype) {
                                            case 'text':
                                                te.init();
                                                te.setValue(msg[1].data, _this.name);
                                                break;
                                            case 'image':
                                                //var url = URL.createObjectURL(msg[1].data)
                                                //$('.file-manager .bar[hash='+_this.hash+'] .file-preview img').attr('src', btoa(msg[1].data));
                                                $('.file-manager .bar[hash='+_this.hash+'] .file-preview img').attr('src', "data:image/*;base64,"+ btoa(msg[1].data));
                                                break;
                                            case 'audio':
                                                switch (getExt(_this.name)) {
                                                    case 'wav':
                                                        $('.file-manager .bar[hash='+_this.hash+'] .file-preview source').attr('src', "data:audio/wave;base64,"+ btoa(msg[1].data));
                                                        break;
                                                    case 'ogg':
                                                        $('.file-manager .bar[hash='+_this.hash+'] .file-preview source').attr('src', "data:audio/ogg;base64,"+ btoa(msg[1].data));
                                                        break;
                                                    default:
                                                        $('.file-manager .bar[hash='+_this.hash+'] .file-preview source').attr('src', "data:audio/mp3;base64,"+ btoa(msg[1].data));
                                                        break;
                                                }
                                                break;
                                            case 'video':
                                                $('.file-manager .bar[hash='+_this.hash+'] .file-preview source').attr('src', "data:video/*;base64,"+ btoa(msg[1].data));
                                                break;
                                            case 'flash':
                                                $('.file-manager .bar[hash='+_this.hash+'] .file-preview embed').attr('src', "data:application/x-shockwave-flash;base64,"+ btoa(msg[1].data));
                                                break;
                                        }
                                    }
                                }
                            }
                        }

                        worker.onerror = function(e) {
                            $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                            $('.file-manager .bar[hash='+_this.hash+'] .file-decrypting-icon').removeClass('active').next().addClass('active');
                            // display some error instead of the preview
                            worker.emit('close');
                        }
                    },
                    error: function(request, error) {
                        console.error(request, error);
                        $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                    }
                });
            } else {
                $('.file-manager .bar[hash='+_this.hash+']').removeClass('loading');
                $('.file-manager .bar[hash='+_this.hash+'] .file-decrypting-icon').removeClass('active').next().addClass('active');
                //$('.file-manager .bar[hash='+_this.hash+'] .file-preview').addClass('active');
            }

            template = _.template($('#fm-file-history-file').html());
            elem = '#file-detail-'+this.hash+' .file-history .file-list';
            $(elem).empty();
            $.ajax({
                type: "POST",
                url: "./api/files/list_versions",
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: {
                    hash: _this.file.hash
                },
                success: function(result) {
                    var res = JSON.parse(result);
                    if (res.length == 0) {
                        $(elem).append(template({
                            name: 'No other versions of this file were found.',
                            size: '',
                            lastmod: ''
                        }));
                    } else {
                        $.each(res, function(i) {
                            $(elem).append(template({
                                name: res[i].name,
                                parent: res[i].parent,
                                hash: res[i].hash,
                                isFolder: res[i].is_folder,
                                size: res[i].size+' bytes',
                                lastmod: res[i].lastmod,
                                shared: res[i].is_shared,
                                public: res[i].is_public
                            }));
                        });
                    }
                },
                error: function(request, error) {
                    console.error(request, error);
                }
            });
        }
        this.refresh = function() {
            item = new FileBar(name, hash, parent);
            var _this = this;
            $('.file-manager .bar[hash='+this.hash+']').addClass('loading');
            $.ajax({
                type: "POST",
                url: "./api/files/get_file",
                headers: {
                    'X-Foxfile-Auth': api_key
                },
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
                            json.enckey,
                            json.is_folder,
                            json.size,
                            json.lastmod,
                            json.is_shared,
                            json.is_public,
                            json.is_trashed);
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
    var File = function(name, parent, hash, key, isFolder, size, lastmod, shared, public, trashed) {
        this.name = name.addSlashes();
        this.parent = parent;
        this.icon = icon;
        this.hash = hash;
        this.key = key;
        this.size = size;
        this.trashed = trashed == '0' ? '' : 'trashed';
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
            return date[1]+" "+date[2]+", "+date[3];
        }
        this.getTime = function() {
            return this.lastmod.toLocaleTimeString();
        }
    }
    $(document).on('click', '.file-manager .menubar-content:not(.btn-ctrlbar):not([trashed])', function(e) {
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
                $('.pages').children().removeClass('active').css('z-index', 400);
                fm.isActive = true;
            }
        }
    });
    $(document).on('click', '.menubar-content .file-multiselect-checkbox-container .label', function(e) {
        e.stopPropagation();
        var hash = $(this).parents('.menubar-content').attr('hash');
        $(this).parents('.menubar-content').addClass('selected');
        if ($(this).parents('.menubar-content[trashed]').length > 0) {
            fm.multiTrash.add(hash);
        } else {
            fm.multiSelect.add(hash);
        }
    });
    $(document).on('click', '.menubar-content .file-multiselect-checkbox-container .label-checked', function(e) {
        e.stopPropagation();
        var hash = $(this).parents('.menubar-content').attr('hash');
        $(this).parents('.menubar-content').removeClass('selected');
        if ($(this).parents('.menubar-content[trashed]').length > 0) {
            fm.multiTrash.remove(hash);
        } else {
            fm.multiSelect.remove(hash);
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
    $(document).on('focus', 'input#search', function(e) {
        $('header.main #nav-header').addClass('searching');
    });
    $(document).on('blur', 'input#search', function(e) {
        $('header.main #nav-header').removeClass('searching');
        if ($(this).val() == '') {
            $('header.main .input-text-placeholder').removeClass('active');
        } else {
            $('header.main .input-text-placeholder').addClass('active');
        }
    });
    $(document).on('keyup', 'input#search', function(e) {
        fm.search($('input#search').val());
    });
    $(document).on("keydown", function(e) {
        switch (e.which) {
            case 16: //shift
                fm.btnStatus.shift = true;
                break;
            case 27: //esc
                if (fm.dialog.dialogActive) {
                    fm.dialog.dialog.hide();
                    fm.dialog.dialogActive = false;
                }
                break;
            case 13: //enter
                if (fm.dialog.dialogActive) {
                    $('.dialog .dialog-btn-submit').click();
                }
                break;
        }

    });
    $(document).on("keyup", function(e) {
        switch (e.which) {
            case 16: 
                fm.btnStatus.shift = false;
                break;
            
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
            internal = false;
            fileDragDrop(e.originalEvent, this);
        });
        $('body').append('<input type="file" name="files[]" class="dd-input-hidden" id="dd-folder-upload" webkitdirectory directory multiple />');
        $('#dd-folder-upload').on('change', function(e) {
            cm.destroy();
            internal = false;
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
        //console.log("Adding DragDrop listeners to " + hash);
        $('.bar#bar-'+hash).on('dragover dragenter', function(e) {
            e.preventDefault();
            //e.stopPropagation();
            if (!hovering) {
                e = e.originalEvent;
                if (e.dataTransfer) {
                    internal = false;
                }
                hovering = true;
                fileDragHover(e, this);
                console.log("Hover entered bar " + $(this).attr('hash'));
                $('#bar-'+$(this).attr('hash')).addClass('hovering');
            }
        });
        $('.bar#bar-'+hash).on('dragleave dragend', function(e) {
            e.preventDefault();
            //e.stopPropagation();
            e = e.originalEvent;
            hovering = false;
            internal = true;
            fileDragLeave(e, this);
            console.log("Hover left bar " + $(this).attr('hash'));
            $('#bar-'+$(this).attr('hash')).removeClass('hovering');
        });
        $('.bar#bar-'+hash).on('drop', function(e) {
            e.preventDefault();
            //e.stopPropagation();
            e = e.originalEvent;
            hovering = false;
            fileDragDrop(e, this);
            console.log("Dropped a file on " + $(this).attr('hash'));
            $('#bar-'+$(this).attr('hash')).removeClass('hovering');
        });
    }
    dd.addSmallListener = function(file) {
        var hash = file.getHash();
        //console.log("Adding DragDrop listeners to " + hash);
        $('.menubar-content#file-'+hash).on('dragover dragenter', function(e) {
            e.preventDefault();
            //e.stopPropagation();
            if (!hovering) {
                e = e.originalEvent;
                if (e.dataTransfer) {
                    internal = false;
                }
                hovering = true;
                fileDragHover(e, this);
                //console.log("Hover entered folder " + $(this).attr('hash'));
                $('.menubar-content#file-'+$(this).attr('hash')).addClass('hovering');
            }
        });
        $('.menubar-content#file-'+hash).on('dragleave dragend', function(e) {
            e.preventDefault();
            //e.stopPropagation();
            e = e.originalEvent;
            hovering = false;
            internal = true;
            fileDragLeave(e, this);
            //console.log("Hover left folder " + $(this).attr('hash'));
            $('.menubar-content#file-'+$(this).attr('hash')).removeClass('hovering');
        });
        $('.menubar-content#file-'+hash).on('drop', function(e) {
            e.preventDefault();
            //e.stopPropagation();
            e = e.originalEvent;
            hovering = false;
            fileDragDrop(e, this);
            console.log("Dropped a file on " + $(this).attr('hash'));
            $('.menubar-content#file-'+$(this).attr('hash')).removeClass('hovering');
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
    }
    function fileDragLeave(e, elem) {
        e.stopPropagation();
        e.preventDefault();
        //timer = window.setTimeout(function() {
            /*var hash = $(elem).attr('hash');
            var barItem;
            for (i = 0; i < fm.getHashTree().length; i++) {
                if (fm.getHashTree()[i] == hash) 
                    barItem = fm.getFileTree()[i];
            }*/
        //}, 25);
    }
    function fileDragDrop(e, elem) {
        e.stopPropagation();
        e.preventDefault();
        var hash = $(elem).attr('hash');
        var parent = $(elem).attr('parent');
        //var parent;
        console.log(internal);
        if (internal) return;
        /*if ($(elem).is('li')) {
            par = $(elem).attr('parent');
            for (i = 0; i < fm.getHashTree().length; i++) {
                if (fm.getHashTree()[i] == par) 
                    parent = fm.getFileTree()[i];
            }
        } else {*/
            /*for (i = 0; i < fm.getHashTree().length; i++) {
                if (fm.getHashTree()[i] == hash) 
                    parent = fm.getFileTree()[i];
            }*/
        //}
        var nextAvailablePositionInQueue = queue.getNextPos();
        var parentParent = $('#bar-'+parent).attr('parent');
        var parentName = $('#bar-'+parent).attr('name');
        var tempFolder = new Folder(nextAvailablePositionInQueue, parentName, parent, parentParent, true);
        tempFolder.hash = hash;
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
        internal = true;
    }
    /* the file inputs need this because they dont fire the same events that drop does */
    /* and there is apparently a bug where the webkitEntry list is always empty. */
    /* this is a nonrecursive function to rebuild the file tree from the webkitRelativePath of the file */
    // no its not
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
                if (file.size > fm.uploadSizeLimit) {
                    parent.addChild(new ChunkedFile(posInQueue, file, file.name, path, parent));
                } else {
                    parent.addChild(new SmallFile(posInQueue, file, file.name, path, parent));
                }
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
                    if (file.size > fm.uploadSizeLimit) {
                        parent.addChild(new ChunkedFile(posInQueue, file, file.name, path, parent));
                    } else {
                        parent.addChild(new SmallFile(posInQueue, file, file.name, path, parent));
                    }
                    queue.triggerStart(posInQueue);
                }
            });
        } else if (item.isDirectory) {
            var dirReader = item.createReader();
            var newFolder = new Folder(posInQueue, item.name, path + item.name + "/", parent, false);
            parent.addChild(newFolder);
            queue.triggerStart(posInQueue);
            var readEntries= function() {
                dirReader.readEntries(function(entries) {
                    //console.log("%cfound folder to add: " + item.name + ", adding to " + parent.name, "color: orange;");
                    for (i = 0; i < entries.length; i++) {
                        //traverseFileTree(entries[i], item.name, path + item.name + "/");
                        traverseFileTree(posInQueue, entries[i], newFolder, path + item.name + "/");
                    }
                    if (!entries.length) {
                        //done
                    } else {
                        readEntries();
                    }
                });
            }
            readEntries();
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
        this.password = null;
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
            for (var i = 0; i < this.children.length; i++) 
                if (this.children[i] instanceof Folder) 
                    tmp.push(this.children[i]);
            for (var i = 0; i < this.children.length; i++) 
                if (this.children[i] instanceof SmallFile || this.children[i] instanceof ChunkedFile)
                    tmp.push(this.children[i]);

            this.children = tmp;
            //console.log("Contents of folder ["+this.name+"]:");
            //console.table(this.children);

            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] instanceof Folder)
                    this.children[i].recursiveHash();
                else 
                    this.children[i].generateHash();
            }
        }
        this.generateHash = function() {
            //console.log("Generating hash for FOLDER: " + this.name + " with parent " + this.parent.name);
            this.password = forge.util.encode64(cr.randomBytes());
            if (this.hash == null) {
                this.addToTransfersPage();
                var _this = this;
                $.ajax({
                    type: "POST",
                    url: "./api/files/uniqid",
                    headers: {
                        'X-Foxfile-Auth': api_key
                    },
                    data: {
                        //name: cr.aesES(_this.name, this.password),
                        name: _this.name,
                        parent: _this.parent.hash,
                        key: cr.aesES(this.password, localStorage.getItem('basekey'))
                    },
                    success: function(result) {
                        var json = JSON.parse(result);
                        _this.hash = json.message;
                        //_this.encrypt();
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
                    headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: {
                    //name: cr.aesES(_this.name, this.password),
                    name: _this.name,
                    hash: _this.hash,
                    parent: _this.parent.hash,
                    key: cr.aesES(this.password, localStorage.getItem('basekey'))
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
                    _this.state = 2;
                    linearQueue.start();
                    //_this.remove();
                },
                error: function(xhr, status, e) {
                    console.log("onError: " + status + " " + e);
                    $('#transfers .file-list #tfile-'+_this.id).removeClass('active').addClass('upload-fail');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Failed");
                    _this.state = 3;
                    linearQueue.start();
                    //_this.remove();
                }
            });
        }
        this.remove = function() {
            //this = null;
        }
        this.encrypt = function() {
            this.upload();
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
            for (i = 0; i < this.children.length; i++) if (this.children[i] instanceof SmallFile || this.children[i] instanceof ChunkedFile) tmp.push(this.children[i]);
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
            for (i = 0; i < this.children.length; i++) if (this.children[i] instanceof SmallFile || this.children[i] instanceof ChunkedFile) tmp.push(this.children[i]);
            this.children = tmp;
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].addToLinearQueue();
            }
        }
    }
    function SmallFile(posInQueue, item, name, path, parent) {
        this.posInQueue = posInQueue;
        this.item = item;
        //this.bytes = null;
        this.name = name;
        this.hash = null;
        this.parent = parent;
        this.path = path;
        this.id = queue.getNextId();
        this.state = 0;
        this.progress = 0;
        this.password = null;
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
            this.password = forge.util.encode64(cr.randomBytes());
            if (this.hash == null) {
                this.addToTransfersPage();
                var _this = this;
                $.ajax({
                    type: "POST",
                    url: "./api/files/uniqid",
                    headers: {
                        'X-Foxfile-Auth': api_key
                    },
                    success: function(result) {
                        var json = JSON.parse(result);
                        _this.hash = json.message;
                        //_this.encrypt();
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
        this.encrypt = function(fake) {
            $('#transfers .file-list #tfile-'+this.id+' .file-upload-status').text("Encrypting");
            var fr = new FileReader();
            var buf;
            var _this = this;
            var fake = fake || false;
            fr.onloadend = function() {
                //buf = cr.bufferToWord(this.result).toString(CryptoJS.enc.Base64);
                buf = this.result;
                if (window.Worker) {
                    var worker = ww.create('crypto');
                    var chunks = cr.chunkString(buf);
                    var cl = chunks.length;
                    console.log('processing '+cl+' chunks');
                    $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').addClass('active');
                    var elem = $('#transfers .file-list #tfile-'+_this.id+' .file-upload-progress-bar');
                    var i = 0;
                    function process() {
                        //console.log('starting chunk '+(i+1)+' of '+cl);
                        elem.css({
                            width: (((i+1) / cl) * 100) + '%'
                        }).attr({value: (i+1), max: cl});
                        
                        if (i < cl) {
                            worker.emit('aes.encrypt.process', {
                                content: chunks.shift(),
                                key: _this.password
                            });
                        }
                    }
                    process();
                    worker.onmessage = function(msg) {
                        //console.log('buffer size: '+msg[1].data);
                        if (++i < cl) {
                            process();
                        } else {
                            console.log('finishing');
                            $('#transfers .file-list #tfile-'+_this.id+' .nameandprogress').removeClass('active');
                            worker.emit('aes.encrypt.finalize');
                            worker.onmessage = function(msg) {
                                var enc = msg[1].data;
                                var bytes = [];
                                for (var i = 0; i < enc.length; i += 512) {
                                    var slice = enc.slice(i, i + 512);
                                    var byteNums = new Array(slice.length);
                                    for (var j = 0; j < slice.length; j++) {
                                        byteNums[j] = slice.charCodeAt(j);
                                    }
                                    var byteArray = new Uint8Array(byteNums);
                                    bytes.push(byteArray);
                                }
                                //var bytes = CryptoJS.enc.u8array.stringify(CryptoJS.enc.Base64.parse(msg[1].data));
                                _this.item = new File([new Blob(bytes)], _this.name);
                                worker.emit('aes.encrypt', {
                                    content: _this.password,
                                    key: localStorage.getItem('basekey')
                                });
                                worker.onmessage = function(msg) {
                                    _this.password = msg[1].data;
                                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Waiting");
                                    worker.emit('close');
                                    _this.upload(fake);
                                }
                            }
                        }
                    }
                } else { // this will crash the browser if the file is too big
                    // this will probably also not work because ive changed how the enc/dec functions work
                    var enc = cr.aesE(buf, _this.password);
                    var bytes = [];
                    for (var i = 0; i < enc.length; i += 512) {
                        var slice = enc.slice(i, i + 512);
                        var byteNums = new Array(slice.length);
                        for (var j = 0; j < slice.length; j++) {
                            byteNums[j] = slice.charCodeAt(j);
                        }
                        var byteArray = new Uint8Array(byteNums);
                        bytes.push(byteArray);
                    }
                    //var bytes = CryptoJS.enc.u8array.stringify(CryptoJS.enc.Base64.parse(enc));
                    _this.item = new File([new Blob(bytes)], _this.name);
                    //_this.bytes = enc;
                    //console.log(_this.item);
                    _this.password = cr.aesE(_this.password, localStorage.getItem('basekey'));
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Waiting");
                    //queue.triggerDone(_this.posInQueue);
                    _this.upload(fake);
                }
            };
            fr.readAsBinaryString(this.item); // this works
            //fr.readAsDataURL(this.item); // test this
            //fr.readAsArrayBuffer(this.item);
        }
        this.fakeUpload = function() {
            this.state = 1;
            var _this = this;
            /*console.log('uploading file: ');
            console.log(this.item);*/
            $('#transfers .file-list #tfile-'+_this.id).addClass('active');
            $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Uploading");
            setTimeout(function() {
                $('#transfers .file-list #tfile-'+_this.id).removeClass('active');
                $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Done");
                $('#transfers #badge-transfers .badgeval').text(--dd.numFilesToUpload);    
                _this.state = 2;
                linearQueue.start(true);
            }, 600);
        }
        this.upload = function(fake) {
            if (fake) return this.fakeUpload;
            this.state = 1;
            var _this = this;
            var formData = new FormData();
            formData.append('file', this.item);
            //formData.append('bytes', this.bytes);
            formData.append('size', this.size);
            //formData.append('name', cr.aesES(this.name, this.password));
            formData.append('name', this.name);
            formData.append('hash', this.hash);
            formData.append('parent', this.parent.hash);
            formData.append('key', this.password);
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
                headers: {
                    'X-Foxfile-Auth': api_key
                },
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
                    _this.state = 2;
                    linearQueue.start();
                    //_this.remove();
                },
                error: function(xhr, status, e) {
                    console.log("onError: " + status + " " + e);
                    $('#transfers .file-list #tfile-'+_this.id).removeClass('active').addClass('upload-fail');
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Failed");
                    if (xhr.status == 507) {
                        $('#transfers .file-list #tfile-'+self.id+' .file-name').text($('#transfers .file-list #tfile-'+self.id+' .file-name').text() + ' (Insufficient storage)');
                    }
                    _this.state = 3;
                    linearQueue.start();
                    //_this.remove();
                }
            });
        }
        this.remove = function() {
            //this = null;
        }
        this.cancel = function() {
            $('#transfers .file-list #tfile-'+this.id).removeClass('active').addClass('upload-fail');
            $('#transfers .file-list #tfile-'+this.id+' .file-upload-status').text("Canceled");
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
        this.chunkQueue = [];
        this.chunkSize = fm.uploadChunkSize;
        this.chunkOffset = 0;
        this.numChunks = 0;
        this.posInQueue = posInQueue;
        this.item = item;
        //this.bytes = null;
        this.name = name;
        this.hash = null;
        this.parent = parent;
        this.path = path;
        this.id = queue.getNextId();
        this.state = 0;
        this.progress = 0;
        this.started = false;
        this.password = null;
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
            return "File";
        }
        this.generateHash = function() {
            //console.log("Generating hash for FILE: " + this.name + " with parent " + this.parent.name);
            this.password = forge.util.encode64(cr.randomBytes());
            if (this.hash == null) {
                this.addToTransfersPage();
                var _this = this;
                $.ajax({
                    type: "POST",
                    url: "./api/files/uniqid",
                    headers: {
                        'X-Foxfile-Auth': api_key
                    },
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
        this.splitChunks = function(fake) {
            var chunks = Math.ceil(this.item.size / this.chunkSize);
            this.numChunks = chunks;

            for (var chunk = 0; chunk < chunks; chunk++) {
    /*          console.log("chunkoffset: "+_this.chunkOffset);
                console.log('chunkSize:'+_this.chunkSize);*/
                this.chunkQueue.push(new Chunk(
                    this,
                    chunk,
                    this.id,
                    this.hash,
                    this.chunkOffset, 
                    this.chunkSize,
                    this.item.slice(this.chunkOffset, this.chunkOffset+this.chunkSize),
                    this.updateProgress
                ));
                this.chunkOffset += this.chunkSize;
            }
            this.upload(false, null, fake);
        }
        this.encrypt = function(fake) {

            // TODO:
            // this should be moved to the individual chunks so that encrypting a file that is >10MB doesnt crash the browser
            // this means that the chunks will need their own encryption queue

            // currently it is working a little better, but still crashes when CryptoJS' finalize() is called on large data.
            // maybe forge can do it better?

            $('#transfers .file-list #tfile-'+this.id+' .file-upload-status').text("Encrypting");
            var fr = new FileReader();
            var buf;
            var _this = this;
            var fake = fake || false;
            fr.onloadend = function() {
                //buf = cr.bufferToWord(this.result);
                buf = this.result;
                //buf = cr.bufferToWord(this.result).toString(CryptoJS.enc.Base64);
                if (window.Worker) {
                    var worker = ww.create('crypto');
                    var chunks = cr.chunkString(buf);
                    var cl = chunks.length;
                    console.log('processing '+cl+' chunks');
                    
                    $('#transfers .file-list #tfile-'+_this.id).addClass('active');
                    var elem = $('#transfers .file-list #tfile-'+_this.id+' .file-upload-progress-bar');
                    var i = 0;
                    function process() {
                        //console.log('starting chunk '+(i+1)+' of '+cl);
                        if (i < cl) {
                            elem.css({
                                width: (((i+1) / cl) * 100) + '%'
                            }).attr({value: (i+1), max: cl});
                            worker.emit('aes.encrypt.process', {
                                content: chunks.shift(),
                                key: _this.password
                            });
                        }
                    }
                    process();
                    worker.onmessage = function(msg) {
                        //console.log('buffer size: '+msg[1].data);
                        if (++i < cl) {
                            process();
                        } else {
                            console.log('finishing');
                            $('#transfers .file-list #tfile-'+_this.id).removeClass('active');
                            worker.emit('aes.encrypt.finalize');
                            worker.onmessage = function(msg) {
                                var enc = msg[1].data;
                                var bytes = [];
                                for (var i = 0; i < enc.length; i += 512) {
                                    var slice = enc.slice(i, i + 512);
                                    var byteNums = new Array(slice.length);
                                    for (var j = 0; j < slice.length; j++) {
                                        byteNums[j] = slice.charCodeAt(j);
                                    }
                                    var byteArray = new Uint8Array(byteNums);
                                    bytes.push(byteArray);
                                }
                                //var bytes = CryptoJS.enc.u8array.stringify(CryptoJS.enc.Base64.parse(msg[1].data));
                                _this.item = new File([new Blob(bytes)], _this.name);
                                worker.emit('aes.encrypt', {
                                    content: _this.password,
                                    key: localStorage.getItem('basekey')
                                });
                                worker.onmessage = function(msg) {
                                    _this.password = msg[1].data;
                                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Waiting");
                                    worker.emit('close');
                                    _this.splitChunks(fake);
                                }
                            }
                        }
                    }
                } else { // this will crash the browser if the file is too big
                    var enc = cr.aesE(buf, _this.password);
                    var bytes = [];
                    for (var i = 0; i < enc.length; i += 512) {
                        var slice = enc.slice(i, i + 512);
                        var byteNums = new Array(slice.length);
                        for (var j = 0; j < slice.length; j++) {
                            byteNums[j] = slice.charCodeAt(j);
                        }
                        var byteArray = new Uint8Array(byteNums);
                        bytes.push(byteArray);
                    }
                    //var bytes = CryptoJS.enc.u8array.stringify(CryptoJS.enc.Base64.parse(enc));
                    _this.item = new File([new Blob(bytes)], _this.name);
                    //console.log(_this.item);
                    _this.password = cr.aesE(_this.password, localStorage.getItem('basekey'));
                    $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Waiting");
                    _this.splitChunks(fake);
                }
            };
            fr.readAsBinaryString(this.item); // this works
            //fr.readAsDataURL(this.item); // test this
            //fr.readAsArrayBuffer(this.item);
        }
        this.fakeUpload = function() {
            this.state = 1;
            var _this = this;
            $('#transfers .file-list #tfile-'+_this.id).addClass('active');
            $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Uploading");
            setTimeout(function() {
                $('#transfers .file-list #tfile-'+_this.id).removeClass('active');
                $('#transfers .file-list #tfile-'+_this.id+' .file-upload-status').text("Done");
                $('#transfers #badge-transfers .badgeval').text(--dd.numFilesToUpload);    
                _this.state = 2;
                linearQueue.start(true);
            }, 600);
        }
        this.updateProgress = function(prog, sf) {
            var elem = $('#transfers .file-list #tfile-'+sf.id+' .file-upload-progress-bar');
            sf.progress += prog;
            var progress = sf.progress;
            var total = sf.item.size;
            //console.log('updateProgress: '+progress+"/"+total+" ("+progress / total + '%)');
            elem.css({
                width: (progress / total) * 100 + '%'
            }).attr({value: progress, max: total});
        }
        this.upload = function(failed, self, fake) {
            if (fake) return this.fakeUpload;
            if (self == null) {
                self = this;
            }
            if (!self.started) { //start chunks
                console.log('start chunks');
                var _self = self;
                $.ajax({
                    type: 'POST',
                    url: './api/files/new_file_chunk',
                    headers: {
                        'X-Foxfile-Auth': api_key // pretty sure mysql caches results
                    },
                    data: {
                        start: _self.hash,
                        size: _self.item.size
                    },
                    beforeSend: function() {
                        $('#transfers .file-list #tfile-'+_self.id).addClass('active');
                        $('#transfers .file-list #tfile-'+_self.id+' .file-upload-status').text("Uploading");
                        _self.started = true;
                    },
                    success: function(result, status, xhr) {
                       _self.upload();
                    },
                    error: function(xhr, status, e) {
                        console.log("onError: " + status + " " + e);
                        $('#transfers .file-list #tfile-'+_self.id).removeClass('active').addClass('upload-fail');
                        $('#transfers .file-list #tfile-'+_self.id+' .file-upload-status').text("Failed");
                        if (xhr.status == 507) {
                            $('#transfers .file-list #tfile-'+self.id+' .file-name').text($('#transfers .file-list #tfile-'+self.id+' .file-name').text() + ' (Insufficient storage)');
                        }
                        _self.upload(true);
                        _self.state = 3;
                    }
                });
            } else {
                if (self.chunkQueue.length == 0) {//finish chunks
                    console.log('finish chunks');
                    var _self = self;
                    $.ajax({
                        type: 'POST',
                        url: './api/files/new_file_chunk',
                        headers: {
                            'X-Foxfile-Auth': api_key
                        },
                        data: {
                            finish: _self.hash,
                            parent: _self.parent.hash,
                            key: _self.password,
                            name: _self.name,
                            //name: cr.aesES(_self.name),
                            size: _self.item.size,
                            num: _self.numChunks
                        },
                        success: function(result, status, xhr) {
                            $('#transfers .file-list #tfile-'+_self.id).removeClass('active').addClass('upload-success');
                            $('#transfers .file-list #tfile-'+_self.id+' .file-upload-status').text("Done");
                            $('#transfers #badge-transfers .badgeval').text(--dd.numFilesToUpload);
                            linearQueue.start();
                        },
                        error: function(xhr, status, e) {
                            console.log("onError: " + status + " " + e);
                            $('#transfers .file-list #tfile-'+_self.id).removeClass('active').addClass('upload-fail');
                            $('#transfers .file-list #tfile-'+_self.id+' .file-upload-status').text("Failed");
                            _self.state = 3;
                            linearQueue.start();
                        }
                    });
                } else if (failed) { //remove failed file
                    console.log('failed chunks');
                    $('#transfers .file-list #tfile-'+self.id).removeClass('active').addClass('upload-fail');
                    $('#transfers .file-list #tfile-'+self.id+' .file-upload-status').text("Failed");
                    var _self = self;
                    this.removePartial();
                    self.state = 3;
                    linearQueue.start();
                } else { //append
                    console.log('append chunks');
                    var next = self.chunkQueue.shift();
                    next.send(self.upload, next);
                }
            }
        }
        this.remove = function() {
            //this = null;
        }
        this.removePartial = function() {
            var _self = this;
             $.ajax({
                type: 'POST',
                url: './api/files/new_file_chunk',
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: {
                    remove: _self.hash
                },
                success: function(result, status, xhr) {
                
                },
                error: function(xhr, status, e) {
                    console.log("onError: " + status + " " + e);
                }
            });
        }
        this.cancel = function() {
            $('#transfers .file-list #tfile-'+this.id).removeClass('active').addClass('upload-fail');
            $('#transfers .file-list #tfile-'+this.id+' .file-upload-status').text("Canceled");
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
    function Chunk(sf, num, id, hash, offset, length, content, onProgress) {
        this.sf = sf;
        this.num = num;
        this.id = id;
        this.hash = hash;
        this.offset = offset;
        this.length = length;
        this.content = content;
        this.state = 0;
        this.onProgress = onProgress;
        this.prev = 0;
        this.send = function(onfinish, self) {
            self.state = 1;
            var formData = new FormData();
            formData.append('append', self.hash);
            formData.append('num', self.num);
            formData.append('length', self.length);
            //console.log(self.content);
            formData.append('data', self.content);
            $.ajax({
                xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    //var xhr = new window.XMLHttpRequest();
                    
                    if(xhr.upload){
                        xhr.upload.addEventListener('progress', function(e) {
                            if(e.lengthComputable) {
                                var diff = e.loaded - self.prev;
                                self.prev = e.loaded;
                                self.onProgress(diff, self.sf);
                            }
                        }, false);
                    }
                    return xhr;
                },
                type: 'POST',
                url: './api/files/new_file_chunk',
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: formData,
                processData: false,
                contentType: false,
                success: function(result, status, xhr) {
                    //console.log("Upload success response: " + result);
                    onfinish(false, self.sf);
                    self.state = 2;
                },
                error: function(xhr, status, e) {
                    console.log("onError: " + status + " " + e);
                    $('#transfers .file-list #tfile-'+self.id).removeClass('active').addClass('upload-fail');
                    $('#transfers .file-list #tfile-'+self.id+' .file-upload-status').text("Failed");
                    onfinish(true, self.sf);
                    self.state = 3;
                }
            });
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
            for (var i = 0; i < fm.simultaneousUploads; i++) {
                //linearQueue.start(true);
                linearQueue.start(null, true);
            }
        }
    }
    function LinearQueue() {
        this.trees = [];
        this.stopped = 0;
        this.started = 0;
        this.add = function(item) {
            this.trees.push(item);
        }
        this.sort = function() {
            var tmp = [];
            for (i = 0; i < this.trees.length; i++) 
                if (this.trees[i] instanceof Folder) tmp.push(this.trees[i]);
            for (i = 0; i < this.trees.length; i++) 
                if (this.trees[i] instanceof SmallFile || this.trees[i] instanceof ChunkedFile) tmp.push(this.trees[i]);
            this.trees = tmp;
        }
        this.next = function() {
            return this.trees.shift();
        }
        this.start = function(fake, begin) {
            var fake = fake || false;
            var begin = begin || false;
            if (begin) {
                if (this.trees.length == 0) {
                    return;
                }
                this.started++;
            }
            if (this.trees.length == 0) {
                this.stopped++;
                if (this.stopped == fm.simultaneousUploads || this.stopped == this.started) {
                    console.log("%cFinishing %cupload of LinearQueue","color:red","color:gray");
                    if (dd.numFilesToUpload == 0)
                        fm.snackbar.create("Finished uploading files", 'view', '$(\'#transfers.btn-ctrlbar\').click()');
                    else
                        fm.snackbar.create("Failed to upload "+dd.numFilesToUpload+" files", 'view', '$(\'#transfers.btn-ctrlbar\').click()');

                    fm.refreshAll();
                    fm.fetchQuota();
                    this.started = 0;
                    this.stopped = 0;
                }
            } else {
                if (fake) {
                    console.log("%cStarting %cencryption and fake upload of LinearQueue","color:green","color:gray");
                    this.next().encrypt(fake);
                } else {
                    console.log("%cStarting %cencryption and upload of LinearQueue","color:green","color:gray");
                    this.next().encrypt();
                }
            }
        }
        this.clean = function() {
            for (var i = 0; i < this.trees.length; i++) {
                if (this.trees[i].state > 0) this.trees = _.without(this.trees, this.trees[i]);
            }
        }
        this.stop = function() {
            while (this.trees.length > 0) {
                this.next().cancel();
            }
            this.trees = [];
            this.stopped = 0;
            fm.refreshAll();
            fm.fetchQuota();
            fm.snackbar.create("Stopped all uploads");
        }
        this.debug = function() {
            console.info("Linear queue contents:");
            console.table(this.trees);
        }
    }

})(window.dd = window.dd || {}, jQuery);
/*
8888888b.  888      
888  "Y88b 888      
888    888 888      
888    888 888      
888    888 888      
888    888 888      
888  .d88P 888      
8888888P"  88888888 
*/
(function(dl, $, undefined) {
    dl.numFilesToDownload = 0;
    function DownloadQueue(ziptree) {
        this.ziptree = ziptree;
        this.queue = [];
        this.first = null;
        this.stopped = 0;
        this.started = 0;
        // add all files to download, fetch data and decrypt, then add to downloadtree to be structured if there is more than 1 file, else save the file
        // add stuff to the tree in a way similar to dd.buildFileTree
        this.add = function(item) {
            this.queue.push(item);
        }
        this.recursiveAdd = function(parent, items) {
            //add stuff to the parent
            if (items.length) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].children) {
                        var f = new DownloadedFolder(this, items[i].name, items[i].hash);
                        parent.addChild(f);
                        this.recursiveAdd(f, items[i].children);
                    } else {
                        var f = new DownloadedFile(this, items[i].name, items[i].hash, items[i].size);
                        f.addToTransfersPage();
                        parent.addChild(f);
                        this.add(f);
                    }
                }
            }
        }
        this.next = function() {
            if (this.ziptree)
                return this.queue.shift();
            else {
                this.first = this.queue.shift();
                return this.first;
            }
        }
        this.sort = function() {
            var tmp = [];
            for (i = 0; i < this.queue.length; i++) 
                if (this.queue[i] instanceof DownloadedFolder) tmp.push(this.queue[i]);
            for (i = 0; i < this.queue.length; i++) 
                if (this.queue[i] instanceof DownloadedFile || this.queue[i] instanceof ChunkedDownloadedFile) tmp.push(this.queue[i]);
            this.queue = tmp;
        }
        this.start = function(fake, begin) {
            var fake = fake || false;
            var begin = begin || false;
            if (begin) {
                if (this.queue.length == 0) {
                    return;
                }
                this.started++;
            }
            if (this.queue.length == 0) {
                this.stopped++;
                //console.log(this.stopped + " " + fm.simultaneousDownloads + " " + this.started);
                if (this.stopped == fm.simultaneousDownloads || this.stopped == this.started) {
                    console.log("%cFinishing %cdownload","color:red","color:gray");
                    this.stopped = 0;
                    this.started = 0;
                    if (dl.numFilesToDownload == 0)
                        fm.snackbar.create("Finished downloading files", 'view', '$(\'#transfers.btn-ctrlbar\').click()');
                    else
                        fm.snackbar.create("Failed to download "+dl.numFilesToDownload+" files", 'view', '$(\'#transfers.btn-ctrlbar\').click()');
                    if (this.ziptree) this.ziptree.zip();
                    else this.save();
                }
            } else {
                console.log("%cStarting %cdecryption and download of DownloadQueue","color:green","color:gray");
                this.next().download();
            }
        }
        this.save = function() {
            this.first.save();
        }
    }
    function DownloadTree(name) {
        this.name = name;
        this.root = new DownloadedFolder(name, '/');
        this.file = new JSZip();
        this.zip = function() {
            this.recursiveAdd(this.file, this.root.children);
            return null;
        }
        this.recursiveAdd = function(parent, items) {

            for (var i = 0; i < items.length; i++) {
                if (items[i] instanceof DownloadedFolder) {
                    this.recursiveAdd(parent.folder(items[i].name), items[i].children);
                }
                if (items[i] instanceof DownloadedFile) {
                    parent.file(items[i].name, items[i].data, {binary: true});
                    items[i].done();
                }
            }
            this.save();
        }
        this.sv = function() {
            var self = this;
            this.file.generateAsync({type: "blob"})
                     .then(function(content) {
                        saveAs(content, self.name+".zip");
                     });
        }
        this.svo = _.once(this.sv);
        this.svdb = _.debounce(this.svo, 300);
        this.save = function() {
            this.svdb();
        }
    }
    function DownloadedFile(q, name, hash, size) {
        this.id = hash;
        this.name = name;
        this.size = size;
        this.hash = hash;
        this.key = null;
        this.data = null;
        this.q = q;
        this.setName = function(name) {
            this.name = name;
        }
        this.getName = function() {
            return this.name;
        }
        this.getType = function() {
            return getType(this);
        }
        this.isFolder = function() {
            return false; // for filetypes.js
        }
        this.getSize = function() {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (this.size == 0) return '0 Bytes';
            var i = parseInt(Math.log(this.size) / Math.log(1024));
            return (this.size / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
        }
        this.download = function () {
            var self = this;
            $('#transfers .file-list #tfile-'+self.id).addClass('active');
            $('#transfers .file-list #tfile-'+self.id+' .file-upload-status').text("Downloading");
            $.ajax({
                xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    //var xhr = new window.XMLHttpRequest();
                    var elem = $('#transfers .file-list #tfile-'+self.id+' .file-upload-progress-bar');
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
                type: "POST",
                url: "./api/files/view",
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: {
                    id: self.hash
                },
                success: function(data, response, xhr) {
                    self.data = data;
                    self.key = xhr.getResponseHeader('X-FoxFile-Key');
                    $('#transfers .file-list #tfile-'+self.id).removeClass('active');
                    $('#transfers .file-list #tfile-'+self.id+' .file-upload-status').text("Waiting");
                    self.decrypt();
                },
                error: function(request, error) {
                    
                }
            });
            // when done, decrypt
        }
        this.decrypt = function() {
            // when done, start next
            //$('#transfers .file-list #tfile-'+self.id).addClass('active');
            $('#transfers .file-list #tfile-'+this.id+' .file-upload-status').text("Decrypting");

            var self = this;
            /*var worker = ww.create('crypto');
            var key = cr.aesD(this.key, localStorage.getItem('basekey'));
            worker.emit('aes.decrypt', {
                content: self.data,
                key: key
            });
            worker.onmessage = function(msg) {
                self.data = msg[1].data;
                dd.numFilesToDisplay--;
                //$('#transfers .file-list #tfile-'+self.id).removeClass('active');
                $('#transfers .file-list #tfile-'+self.id+' .file-upload-status').text("Waiting");
                $('#transfers #badge-transfers .badgeval').text(--dl.numFilesToDownload);
                self.q.start()
                worker.emit('close', {
                    content: 'pls'
                });
            }*/
            var worker = ww.create('crypto');
            worker.emit('aes.decrypt', {
                content: self.key,
                key: localStorage.getItem('basekey')
            });
            worker.onmessage = function(msg) {
                var key = msg[1].data;
                /*var iv = self.data.substr(0, cr.ivLength);
                var chunks = cr.chunkString(self.data.substr(cr.ivLength));*/
                var chunks = cr.chunkString(self.data);
                delete self.data;
                var cl = chunks.length;
                console.log('processing '+cl+' chunks');
                var i = 0;
                $('#transfers .file-list #tfile-'+self.id).addClass('active');
                var elem = $('#transfers .file-list #tfile-'+self.id+' .file-upload-progress-bar');
                function process() {
                    console.log('starting chunk '+(i+1)+' of '+cl);
                    if (i < cl) {
                        elem.css({
                            width: (i / cl) * 100 + '%'
                        }).attr({value: i, max: cl});
                        worker.emit('aes.decrypt.process', {
                            content: chunks.shift(),
                            key: key/*,
                            iv: iv*/
                        });
                    }
                }
                process();
                worker.onmessage = function(msg) {
                    //console.log('buffer size: '+msg[1].data);
                    if (++i < cl) {
                        process();
                    } else {
                        console.log('finishing');
                        worker.emit('aes.decrypt.finalize');
                        worker.onmessage = function(msg) {   
                            elem.css({
                                width: '100%'
                            });                                 
                            worker.emit('close');
                            self.data = msg[1].data;
                            dd.numFilesToDisplay--;
                            $('#transfers .file-list #tfile-'+self.id).removeClass('active');
                            $('#transfers .file-list #tfile-'+self.id+' .file-upload-status').text("Waiting");
                            $('#transfers #badge-transfers .badgeval').text(--dl.numFilesToDownload);
                            self.q.start()            
                        }
                    }   
                }   
            }
            worker.onerror = function(e) {
                worker.emit('close');
            }
        }
        this.save = function() {
            var self = this;
            var data = this.data;
            var bytes = [];
            for (var i = 0; i < data.length; i += 512) {
                var slice = data.slice(i, i + 512);
                var byteNums = new Array(slice.length);
                for (var j = 0; j < slice.length; j++) {
                    byteNums[j] = slice.charCodeAt(j);
                }
                var byteArray = new Uint8Array(byteNums);
                bytes.push(byteArray);
            }
            saveAs(new File([new Blob(bytes)], self.name, {type: 'application/octet-binary'}), self.name);
            this.done();
        }
        this.done = function() {
            $('#transfers .file-list #tfile-'+this.id).addClass('upload-success');
            $('#transfers .file-list #tfile-'+this.id+' .file-upload-status').text("Done");
        }
        this.addToTransfersPage = function() {
            var template = _.template($('#fm-file-transferring').html());
            if ($('#transfers .file-list').hasClass('empty')) {
                $('#transfers .file-list').empty().removeClass('empty');
                $('#transfers .file-list').append('<ul></ul>');
            }
            $('#transfers .file-list ul').append(template(this));
            $('#transfers #badge-transfers').addClass('new');
            $('#transfers #badge-transfers .badgeval').text(++dl.numFilesToDownload);
            dd.numFilesToDisplay++;
        }
    }
    function DownloadedFolder(q, name, hash) {
        this.q = q;
        this.name = name;
        this.hash = hash;
        //this.path = path;
        this.children = [];
        this.setName = function(name) {
            this.name = name;
        }
        this.addChild = function(child) {
            this.children.push(child);
        }
    }
    function isTree(result) {
        if (result)
            if (result[0])
                if (result[1]) return true;
                else if (result[0].children) return true;
        return false;
    }
    /*
    @param isFolder   whether or not its a folder
    @param hashlist   an array of hashes to get
    */
    dl.start = function(isFolder, hashlist) {
        console.log('downloading');
        $.ajax({
            type: 'POST',
            url: './api/files/get_file_tree',
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hashlist: hashlist.toString()
            },
            success: function(result, status, xhr) {
                var json = JSON.parse(result);
                if (!isTree(json)) {
                    var q = new DownloadQueue();
                    var f = new DownloadedFile(q, json[0].name, json[0].hash, json[0].size);
                    f.addToTransfersPage();
                    q.add(f);
                    for (var i = 0; i < fm.simultaneousDownloads; i++) {
                        q.start(null, true);
                    }
                } else {
                    console.log('multi: '+json[0].hash);

                    var t = new DownloadTree(json[0].name);
                    var q = new DownloadQueue(t);

                    q.recursiveAdd(t.root, json);
                    q.sort();

                    for (var i = 0; i < fm.simultaneousDownloads; i++) {
                        q.start(null, true);
                    }                
               }
            },
            error: function(xhr, status, e) {
                
            }
        });
    }
})(window.dl = window.dl || {}, jQuery);
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
    $(document).on("contextmenu", ".file-manager .file-list:not(#bar-0 .file-list):not(#bar-search .file-list)", function(e) {
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
    $(document).on("contextmenu", ".file-manager .menubar-content:not(.btn-ctrlbar):not([trashed])", function(e) {
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
                //fcm.menu.append(new MenuItem(cm.menu, "Get public link", "link", "fm.dialog.share.show('"+name+"','"+hash+"')", "L").get());
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
    $(document).on("click", ".file-manager .bar:not([id^='file-detail-']):not(#bar-search):not(.active) .file-actions-header span", function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (!fm.btnStatus.shift) {
            var self = $(this).parents('.bar');
            var hash = self.attr('hash');
            var name = self.attr('name');
            cm.destroy();
            cm.menu = new ClickMenu(e.pageX - 180, 112);
            if (hash == foxfile_root) {
                //cm.menu.append(new MenuItem(cm.menu, "Information", 'information-outline', "fm.toggleInfoView('"+hash+"', false)", 'i').get());
                //cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Upload File", "upload", "$('#dd-file-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "Upload Folder", "folder-upload", "$('#dd-folder-upload').attr('hash','"+hash+"').click()").get());
                cm.menu.append(new MenuItem(cm.menu, "New Folder", "folder-plus", "fm.dialog.newFolder.show('"+name+"','"+hash+"')", "Alt+N").get());
                cm.menu.append('<hr class="nav-vert-divider">');
                cm.menu.append(new MenuItem(cm.menu, "Refresh", "refresh", "fm.refresh('"+hash+"')", "Alt+R").get());
            } else {
                //cm.menu.append(new MenuItem(cm.menu, "Information", 'information-outline', "fm.toggleInfoView('"+hash+"', false)", 'i').get());
                //cm.menu.append('<hr class="nav-vert-divider">');
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
    $(document).on("click", ".file-manager .bar.viewdetails:not([id^='file-detail-']):not(#bar-search) .file-actions-header span", function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (!fm.btnStatus.shift) {
            var self = $(this).parents('.bar');
            var hash = self.attr('hash');
            cm.destroy();
            cm.menu = new ClickMenu(e.pageX - 180, 112);
            cm.menu.append(new MenuItem(cm.menu, "View files", 'eye', "fm.toggleInfoView('"+hash+"', false)", 'i').get());
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
    $(document).on("contextmenu", ".bar-trash .menubar-content, .menubar-content[trashed]", function(e) {
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
        /*if (editor != null) {
            $('#editor')[0].CodeMirror.toTextArea();
        }*/
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
888       888 888       888 
888   o   888 888   o   888 
888  d8b  888 888  d8b  888 
888 d888b 888 888 d888b 888 
888d88888b888 888d88888b888 
88888P Y88888 88888P Y88888 
8888P   Y8888 8888P   Y8888 
888P     Y888 888P     Y888                    
*/
(function(ww, $, undefined) {
    ww.create = function(which) {
        //console.log('Creating new '+which+' worker');
        if (window.Worker) {
            switch (which) {
                case 'crypto': return new FoxFileWorker('./js/ww_crypt.js'+'?'+btoa(cr.randomBytes(2)));
                case 'xhr': return new FoxFileWorker('./js/ww_xhr.js'+'?'+btoa(cr.randomBytes(2)));
                default: return false;
            }
        }
        console.warn('WebWorkers are not supported by this browser.');
        return false;
    }
    function FoxFileWorker(script) {
        var self = this;
        this.worker = new Worker(script);
        this.emit = function(msg, data) {
            this.worker.postMessage([msg, data]);
        }
        this.onmessage = null;
        this.onerror = null;
        this.worker.addEventListener('message', function(msg) {
            if (typeof self.onmessage === 'function') {
                setTimeout(function() {
                    self.onmessage(msg.data);
                }, 1);
            }
        }, false);
        this.worker.addEventListener('error', function(e) {
            console.error(e.filename+"("+e.lineno+"): "+e.message);
            if (typeof self.onerror === 'function') {
                setTimeout(function() {
                    self.onerror(e);
                }, 1);
            }
        });
        this.emit('init', {
            basekey: localStorage.getItem('basekey'),
            privkey: localStorage.getItem('privkey'),
            pubkey: localStorage.getItem('pubkey')
        });
    }
})(window.ww = window.ww || {}, jQuery);
/*
 .d8888b.  8888888b.  
d88P  Y88b 888   Y88b 
888    888 888    888 
888        888   d88P 
888        8888888P"  
888    888 888 T88b   
Y88b  d88P 888  T88b  
 "Y8888P"  888   T88b 
*/
(function(cr, $, undefined) {
    String.prototype.getBytes = function() {
        var bytes = [];
        for (var i = 0; i < this.length; i++) {
            var charCode = this.charCodeAt(i);
            var cLen = Math.ceil(Math.log(charCode)/Math.log(256));
            for (var j = 0; j < cLen; j++) {
                bytes.push((charCode << (j*8)) & 0xFF);
            }
        }
        return bytes;
    }
    function make_bytes(str) {
        var bytes = str.getBytes();
        var nearest_power_of_2 = Math.pow(2, Math.ceil(Math.log(bytes.length) / Math.log(2)));
        if (bytes.length != nearest_power_of_2) {
            var remainder = nearest_power_of_2 - bytes.length;
            for(var i=0; i<remainder; i++) {
                var j = i % bytes.length;
                bytes.push(bytes[j]);
            }
        }
        return bytes;
    }
    CryptoJS.enc.u8array = {
        // https://groups.google.com/forum/#!msg/crypto-js/TOb92tcJlU0/Eq7VZ5tpi-QJ
        stringify: function (wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var u8 = new Uint8Array(sigBytes);
            for (var i = 0; i < sigBytes; i++) {
                var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                u8[i]=byte;
            }
            return u8;
        },
        parse: function (u8arr) {
            var len = u8arr.length;
            var words = [];
            for (var i = 0; i < len; i++) {
                words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
            }
            return CryptoJS.lib.WordArray.create(words, len);
        }
    }
    cr.randomBytes = function(bytes) {
        var bytes = bytes || 32;
        return forge.random.getBytesSync(bytes);
    }
    cr.bufferToWord = function(buffer) {
        return CryptoJS.lib.WordArray.create(buffer);
    }
    cr.chunkString = function(str) {
        return str.match(/(.|[\r\n]){1,8192}/g);
    }
    function mapper(k) {
        return parseInt(k, null);
    }
    function sorter(a, b) {
        return a - b;
    }
    cr.ivLength = 24;
    cr.aesE = function(str, key) {
        var iv = CryptoJS.lib.WordArray.random(cr.ivLength / 3 * 2);
        //var iv = CryptoJS.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
        /*var enc = CryptoJS.AES.encrypt(str, key, {iv: iv});
        return enc.toString();
        console.log(enc.toString());*/
        var en = CryptoJS.algo.AES.createEncryptor(key, {iv: iv});
        var chunks = cr.chunkString(str);
        //console.log(chunks);
        var enc = null;
        delete str;
        _.each(_.map(_.keys(chunks), mapper).sort(sorter),
            function(i) {
                var chunk = CryptoJS.enc.Utf8.parse(chunks[i]);
                //var chunk = chunks[i];
                var block = en.process(chunk);
                if (!enc) enc = block;
                else enc.concat(block);
            });
        enc.concat(en.finalize());
        //console.log('encIV: '+iv.toString(CryptoJS.enc.Base64));
        //console.log(enc);
        //console.log('encE: '+enc.toString(CryptoJS.enc.Base64));
        return iv.toString(CryptoJS.enc.Base64) + enc.toString(CryptoJS.enc.Base64);
    }
    cr.aesD = function(b64, key) {
        //return CryptoJS.AES.decrypt(b64.substr(24), key).toString(CryptoJS.enc.Utf8);
        var iv = CryptoJS.enc.Base64.parse(b64.substr(0, cr.ivLength));
        //var iv = CryptoJS.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
        var chunks = cr.chunkString(b64.substr(cr.ivLength));
        //console.log('decIV: '+iv.toString(CryptoJS.enc.Base64));
        //console.log(chunks);
        delete b64;
        var en = CryptoJS.algo.AES.createDecryptor(key, {iv: iv});
        var enc = null;
        _.each(_.map(_.keys(chunks), mapper).sort(sorter),
            function(i) {
                var chunk = CryptoJS.enc.Base64.parse(chunks[i]);    
                var block = en.process(chunk);
                if (!enc) enc = block;
                else enc.concat(block);
            });
        enc.concat(en.finalize());
        //console.log('dec: '+enc.toString(CryptoJS.enc.Utf8));
        return enc.toString(CryptoJS.enc.Utf8);
    }
    cr.aesES = function(str, key) {
        return CryptoJS.AES.encrypt(str, key).toString();
    }
    cr.aesDS = function(str, key) {
        return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
    }
    cr.rsaE = function(str) {
        var privk = forge.pki.decryptRsaPrivateKey(localStorage.getItem('privkey'), localStorage.getItem('basekey'));
        var buf = forge.util.createBuffer(str, 'utf8');
        var enc = forge.pki.rsa.encrypt(buf.getBytes(), privk, 0x01);;
        return forge.util.encode64(enc);
    }
    cr.rsaD = function(str) {
        var str = forge.util.decode64(str);
        var pubk = forge.pki.publicKeyFromPem(localStorage.getItem('pubkey'));
        var buf = forge.util.createBuffer(str);
        var dec = forge.pki.rsa.decrypt(buf.getBytes(), pubk, 0x01);
        return dec;
    }
    $().mousemove(function(e) {
        forge.random.collectInt(e.clientX, 16);
        forge.random.collectInt(e.clientY, 16);
    });
})(window.cr = window.cr || {}, jQuery);


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