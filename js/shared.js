/* 
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                                  
    Foxfile : shared.js 
    Copyright (C) 2016 Theodore Kluge
    https://tkluge.net
*/
(function(shared, $, undefined) {
    shared.init = function(){
        shared.fetch(shared_id);
    }
    shared.cbyte = function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
    shared.hashes = [];
    shared.type = 'file';
    shared.name = '';
    shared.snackbar = {
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
                var n = shared.snackbar.nextInQueue();
                if (n)
                n.show();
            }, 500);
        },
        Snackbar: function(msg, action, fn) {
            this.id = shared.snackbar.nextID++;
            this.message = msg;
            this.action = action;
            this.fn = fn;
            this.timer = null;
            this.create = function() {
                $('body').append(shared.snackbar.template(this));
            }
            this.show = function() {
                $('#snackbar-'+this.id).addClass('active');
                var _this = this;
                _this.timer = setTimeout(function() {
                    _this.hide();
                    setTimeout(function() {
                        var n = shared.snackbar.nextInQueue();
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
    shared.fetch = function(hash) {
        $.ajax({
            url: './../api/shared/fetch',
            type: 'POST',
            data: {
                hash: hash
            },
            success: function(result, status, xhr) {
                var json = JSON.parse(result);
                var resp = json['response'];
                var num = json['num_results'];
                if (num > 0) {
                    $('.content .file .file-name').text(
                        resp[0]['name'] + 
                        (resp.length > 1 ? ' and '+(resp.length - 1)+' others':'')
                    );
                    shared.name = resp[0]['name'];
                    for (var i = 0; i < num; i++) {
                        shared.hashes.push(resp[i]['hash']);
                        if (resp[i]['type'] == '1') shared.type = 'folder';
                    }
                    /*if (_.indexOf(['jpg','jpeg','gif','png'], getExt(shared.name)) > -1) {
                        $('.img-prev').attr('src', './../api/files/view?id='+shared.hashes[0]);
                    }*/
                    $('.content .inactive').removeClass('inactive');
                } else {
                     $('.content .file .file-name').text('404');
                }
                $('.bar-shared').removeClass('loading');
            },
            error: function(xhr, status, e) {
                fm.snackbar.create("Failed to fetch shared file");
            }
        });
    }
    shared.download = function() {
        var type = shared.type;
        var name = shared.name;
        var _id = shared.hashes[0];
        if (shared.hashes.length > 1 || type == 'folder') {
            var hashes = _.uniq(shared.hashes);
            var frame = $("<iframe></iframe>").attr('src', './../api/files/download?hashlist='+hashes.toString()+"&name="+name+"&type="+type).attr('id', _id).css('display', 'none');
            frame.appendTo('body');
            setTimeout(function() {
                $('body > iframe#'+_id).remove();
            }, 10000);
            shared.snackbar.create("Downloading files");
        } else {
            var frame = $("<iframe></iframe>").attr('src', './../api/files/download?id='+_id+"&name="+name).attr('id', _id).css('display', 'none');
            frame.appendTo('body');
            setTimeout(function() {
                $('body > iframe#'+_id).remove();
            }, 10000);
            shared.snackbar.create("Downloading file");
        }
    }
    shared.copy = function() {
        var hashes = _.uniq(shared.hashes);
        $.ajax({
            url: './../api/shared/copy',
            type: 'POST',
            data: {
                hashlist: hashes.toString()
            },
            success: function(result, status, xhr) {
                fm.snackbar.create("Copied file", 'view', 'document.location.href=\'./../browse\'')
            },
            error: function(xhr, status, e) {
                fm.snackbar.create("Failed to copy file");
            }
        });
    }
})(window.shared = window.shared || {}, jQuery);