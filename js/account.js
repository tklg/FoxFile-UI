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
        if (localStorage.getItem('theme'))
            if (localStorage.getItem('theme') == 'night') {
                $('body').addClass('foxfile-dark');
                $('input#theme').prop('checked', true);
            }
    }
    account.logout = function() {
        localStorage.removeItem('api_key');
        document.location.href = './logout';
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
                    "security": "openSec",
                    "history": "openHistory"
                }
            });
            this.router = new Router();
            this.router.on('route:loadAcct', function(filePath) {
                document.title = 'My Account - FoxFile';
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
                account.loadAcct();
            });
            this.router.on('route:openHistory', function(sort) {
                document.title = 'Account History - FoxFile';
                $('#bar-0 li#history').addClass('active').siblings().removeClass('active');
                $('.bar-history').addClass('active').css('z-index', 401).siblings().css('z-index', 400).removeClass('active');
                account.loadAcct();
            });
            Backbone.history.start();
        }
    }
    var rightnav = {
    	toggle: function() {
    		$('#nav-right').toggleClass('active');
        }
    }
    function sha512(str) {
        var md = forge.md.sha512.create();
        md.update(str);
        return md.digest().toHex();
    }
    account.loadAcct = function() {
        $('.bar-account, .bar-settings, .bar-security, .bar-history').addClass('loading');
        $.ajax({
            type: "POST",
            url: "./api/users/account",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            success: function(result) {
                var json = JSON.parse(result);
                var c = json['content'];
                var q = c['quota'];
                var k = c['keys'];
                $('[fetch-data=user-first]').text(c['firstname']);
                $('[fetch-data=user-name]').text(c['username']);
                $('[fetch-data=user-email]').text(c['email']);
                $('[fetch-data=user-gravatar]').attr('src', '//gravatar.com/avatar/'+c['md5']+'?d=retro&r=r');

                $('#firstname').val(c['firstname']);
                $('#lastname').val(c['lastname']);
                $('#email').val(c['email']);
                var date = new Date(c['joindate']);
                var d = date.toDateString().split(' ');
                $('#join').text(d[1]+" "+d[2]+", "+d[3] + " " + date.toLocaleTimeString());
                $('#foxid').text(c['uid']+":"+c['root']);
                var ev = c['status'];
                $('#email-ver').text(ev).addClass(ev);
                if (ev != 'verified') {
                    $('#email-resend').removeClass('hidden');
                }
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

                var template = _.template($('#template-key').html());
                $('.acc-h').empty();
                for (var i = 0; i < k.length; i++) {
                    $('.acc-h').append(template({
                        ua: k[i]['user_agent'],
                        date: k[i]['last_mod'],
                        ip: k[i]['created_by'],
                        country: k[i]['country'],
                        key: k[i]['api_key'],
                        current: k[i]['api_key'] == api_key ? 'current':'',
                        status: k[i]['status'] == 'good' 
                            ? (k[i]['active'] == '1' 
                                ? 'active' 
                                : 'expired')
                            : 'expired'
                    }));
                }

                $('.bar-account, .bar-settings, .bar-security, .bar-history').removeClass('loading');
            },
            error: function(request, error) {
                if (request.status == 404) {
                    account.snackbar.create('Auth key is invalid','logout','document.location.href=\'./login\'');
                    setTimeout(function() {
                        document.location.href = './login';
                    }, 3000);
                }
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
    account.dialog = {
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
            if (this.dialog)
                this.dialog.hide();
        },
        removeAccount: {
            id: '',
            show: function(file, id) {
                id = 0;
                this.id = id;
                var footer = new account.dialog.DialogFooter();
                footer.addOpt(new account.dialog.DialogFooterOption('Cancel', 'default', 'account.dialog.removeAccount.hide()'));
                footer.addOpt(new account.dialog.DialogFooterOption('Deactivate', 'submit', 'account.deactivate()'));
                account.dialog.dialog = new account.dialog.Dialog(
                    id,
                    'Are you sure?',
                    'All of your files will be deleted and your account will be removed.<br>This cannot be undone.<br><hr>'
                    +'Enter your password to continue:<br>'
                    +'<input type=\'password\' id=\'confpass\' />',
                    footer.html()
                );
                account.dialog.dialog.show();
                account.dialog.dialogActive = true;
            },
            hide: function() {
                account.dialog.dialog.hide();
                account.dialog.dialogActive = false;
            }
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
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: data,
            processData: false,
            contentType: false,
            success: function(result, s, x) {
                $('.bar-account').removeClass('loading');
                account.snackbar.create("Updated "+which+" name");
            },
            error: function(request, error) {
                $('.bar-account').removeClass('loading');
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
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: {
                    id: 'me',
                    email: email
                },
                success: function(result) {
                    $('.bar-account').removeClass('loading');
                    account.snackbar.create("Updated email");
                },
                error: function(request, error) {
                    $('.bar-account').removeClass('loading');
                    account.snackbar.create("Failed to save changes");
                }
            });
        } else {
            account.snackbar.create("Please enter a valid email");
        }
    }
    account.changePass = function() {
        var pass = $('#password').val();
        var pass2 = $('#password2').val();
        if (pass != pass2) {
            account.snackbar.create("Passwords do not match");
            return;
        }
        if (pass == '') {
            account.snackbar.create("Password cannot be blank");
            return;
        }
        $('.bar-security').addClass('loading');
        $('.btn-save').blur();
        $.ajax({
            type: "POST",
            url: "./api/users/update",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                id: 'me',
                pass: pass,
                pass2: pass2
            },
            success: function(result) {
                $('.bar-security').removeClass('loading');
                account.snackbar.create("Changed password");
                $('#password').val('');
                $('#password2').val('');
            },
            error: function(request, error) {
                $('.bar-security').removeClass('loading');
                account.snackbar.create("Failed to save changes");
            }
        });
    }
    account.sendVerificationEmail = function() {
        var email = $('#email').val();
        $.ajax({
            type: "POST",
            url: "./api/auth/send_verification",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                email: email,
                extra: false
            },
            success: function(result) {
                account.snackbar.create("Verification email sent");
            },
            error: function(request, error) {
                account.snackbar.create("Failed to send verification email");
            }
        });
    }
    account.invalidateKey = function(key) {
        $.ajax({
            type: "POST",
            url: "./api/users/invalidate_key",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                key: key
            },
            success: function(result) {
                $('#'+key).text('Expired');
                account.snackbar.create("Logged out of one session");
                account.loadAcct();
            },
            error: function(request, error) {
                account.snackbar.create("Failed to invalidate key");
            }
        });
    }
    account.deactivate = function() {
        account.dialog.removeAccount.hide();
        $.ajax({
            type: "POST",
            url: "./api/users/remove",
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                pass: sha512($('#confpass').val())
            },
            success: function(result) {
                account.snackbar.create("Account has been removed.");
                localStorage.removeItem('api_key');
                setTimeout(function() {
                    document.location.href = './';
                }, 3000);
            },
            error: function(request, error) {
                if (request.status == 401) {
                    account.snackbar.create('Incorrect password');
                } else {
                    account.snackbar.create("Failed to remove account - no escape yet.");
                }
            }
        });
    }
    account.backupKey = function() {
        saveAs(new File(['FoxFile Master Key for '+localStorage.getItem('email')+':\r\n'+localStorage.getItem('basekey')], 'FoxFile Master Key.txt'), 'FoxFile Master Key.txt');
    }
    $(document).on('click', '.btn-ctrlbar', function(e) {
        account.routerbox.router.navigate($(this).attr('id'), {trigger: true, replace: true});
    });
    $(document).on('click', '.user-menu, .nav-right-active-cover, #nav-right .closeOnClick', function(e) {
    	rightnav.toggle();
    });
    $('input#theme').change(function() {
        if ($(this).prop('checked')) {
            localStorage.setItem('theme', 'night');
            $('body').addClass('foxfile-dark');
        } else {
            localStorage.removeItem('theme');
            $('body').removeClass('foxfile-dark');
        }
    });
})(window.account = window.account || {}, jQuery);