/* 
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                                  
    Foxfile : account.js 
    Copyright (C) 2016 Theodore Kluge
    https://tkluge.net
*/
(function(account, $, undefined) {
    account.init = function(){
        account.routerbox.init();
    }
    account.routerbox = {
        router: null,
        init: function() {
            console.info("Initialize router");
            var ViewsFactory = {};
            var Router = Backbone.Router.extend({
                routes: {
                    "": "loadAcct",
                    "account": "loadAcct",
                    "settings": "openSettings",
                    "security": "openSec"
                    //"history": "openHistory"
                }
            });
            this.router = new Router();
            this.router.on('route:loadAcct', function(filePath) {
                $('#bar-0 li#account').addClass('active').siblings().removeClass('active');
                $('.bar-account').addClass('active').css('z-index', 401).siblings().css('z-index', 400).removeClass('active');
                account.loadAcct();
            });
            this.router.on('route:openSettings', function(filePath) {
                document.title = 'Account Settings - FoxFile';
                $('#bar-0 li#settings').addClass('active').siblings().removeClass('active');
                $('.bar-settings').addClass('active').css('z-index', 401).siblings().css('z-index', 400).removeClass('active');
                account.loadAcct();
            });
            this.router.on('route:openSec', function(sort) {
                document.title = 'Account Security - FoxFile';
                $('#bar-0 li#security').addClass('active').siblings().removeClass('active');
                $('.bar-security').addClass('active').css('z-index', 401).siblings().css('z-index', 400).removeClass('active');
                account.loadSecurity();
            });
            this.router.on('route:openHistory', function(sort) {
                document.title = 'Account History - FoxFile';
                $('#bar-0 li#history').addClass('active').siblings().removeClass('active');
                $('.bar-history').addClass('active').css('z-index', 401).siblings().css('z-index', 400).removeClass('active');
                account.loadHistory();
            });
            Backbone.history.start();
        }
    }
    var rightnav = {
    	toggle: function() {
    		$('#nav-right').toggleClass('active');
        }
    }
    account.loadAcct = function() {
        $('.bar-account, .bar-settings').addClass('loading');
        $.ajax({
            type: "POST",
            url: "./api/users/account",
            data: {
                id: 'me'
            },
            success: function(result) {
                var json = JSON.parse(result);
                var c = json['content'];
                var q = c['quota'];
                $('#firstname').val(c['firstname']);
                $('#lastname').val(c['lastname']);
                $('#email').val(c['email']);
                var date = new Date(c['joindate']);
                var d = date.toDateString().split(' ');
                $('#join').text(d[1]+" "+d[2]+", "+d[3] + " " + date.toLocaleTimeString());
                $('#foxid').text(c['foxid']+":"+c['root']);
                $('#email-ver').text(c['status']).addClass(c['status']);
                var s_f = q['files'],
                    s_t = q['trash'],
                    s = q['total'];
                $('#filepercent').text(account.cbyte(s_f));
                //$('#trashpercent').text(account.cbyte(s_t));
                $('#s_total').text(/*'Out of ' + */account.cbyte(s));
                $('.prog-f').css({
                    width: (s_f / s) * 100 + "%"
                });
                /*$('.prog-t').css({
                    width: (s_t / s) * 100 + "%"
                });*/

                $('.bar-account, .bar-settings').removeClass('loading');
            },
            error: function(request, error) {
                
            }
        });
    }
    account.loadSettings = function() {
        $('.bar-settings').addClass('loading');
        $('.bar-settings').removeClass('loading');
    }
    account.loadSecurity = function() {
        $('.bar-security').addClass('loading');
        $('.bar-security').removeClass('loading');
    }
    account.loadHistory = function() {
        $('.bar-history').addClass('loading');
        $('.bar-history').removeClass('loading');
    }
    account.cbyte = function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
    account.snackbar = {
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
                var n = account.snackbar.nextInQueue();
                if (n)
                n.show();
            }, 500);
        },
        Snackbar: function(msg, action, fn) {
            this.id = account.snackbar.nextID++;
            this.message = msg;
            this.action = action;
            this.fn = fn;
            this.timer = null;
            this.create = function() {
                $('body').append(account.snackbar.template(this));
            }
            this.show = function() {
                $('#snackbar-'+this.id).addClass('active');
                var _this = this;
                _this.timer = setTimeout(function() {
                    _this.hide();
                    setTimeout(function() {
                        var n = account.snackbar.nextInQueue();
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
    account.changeName = function(name, which) {
        console.log(name + " " + which);
        $('.btn-save').blur();
        $('.bar-account').addClass('loading');
        var data = new FormData();
        data.append('id', 'me');
        if (which == 'first') {
            data.append('firstname', name);
        } else {
            data.append('lastname', name);
        }
        $.ajax({
            type: "POST",
            url: "./api/users/update",
            data: data,
            processData: false,
            contentType: false,
            success: function(result, s, x) {
                var json = JSON.parse(result);

                $('.bar-account').removeClass('loading');
                account.snackbar.create("Updated "+which+" name");
            },
            error: function(request, error) {
                account.snackbar.create("Failed to save changes");
            }
        });
    }
    account.changeEmail = function(email) {
        $('.bar-account').addClass('loading');
        $('.btn-save').blur();
        if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(email)) {
            $.ajax({
                type: "POST",
                url: "./api/users/update",
                data: {
                    id: 'me',
                    email: email
                },
                success: function(result) {
                    var json = JSON.parse(result);

                    $('.bar-account').removeClass('loading');
                    account.snackbar.create("Updated email");
                },
                error: function(request, error) {
                    account.snackbar.create("Failed to save changes");
                }
            });
        } else {
            account.snackbar.create("Please enter a valid email");
        }
    }
    $(document).on('click', '.btn-ctrlbar', function(e) {
        account.routerbox.router.navigate($(this).attr('id'), {trigger: true, replace: true});
    });
    $(document).on('click', '.user-menu, .nav-right-active-cover, #nav-right .closeOnClick', function(e) {
    	rightnav.toggle();
    });
})(window.account = window.account || {}, jQuery);