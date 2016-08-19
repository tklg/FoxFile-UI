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
    shared.deckey = null;
    shared.init = function(){
        if (logged_in) {
            $.ajax({
                type: "POST",
                url: "./../api/users/info",
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                success: function(result, s, x) {
                    //console.log(result);
                    json = JSON.parse(result);
                    $('[fetch-data=user-name]').text(json['username']);
                    $('[fetch-data=user-email]').text(json['email']);
                    $('header.hidden, .file-list, .promo').toggleClass('hidden');
                },
                error: function(request, error) {
                    //console.error(request, error);
                }
            });
        }
        if (shared_id.indexOf(".") !== -1) {
            var s = shared_id;
            shared_id = s.split(".")[0];
            shared.deckey = btoa(forge.util.hexToBytes(s.split(".")[1]));
        }
        if (shared.deckey == null) {
            shared.askForKey();
        }
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
    shared.simultaneousDownloads = 3;
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
                    document.title = 'FoxFile - ' + resp[0]['name'] + (resp.length > 1 ? ' and '+(resp.length - 1)+' others':'');
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
                     $('.content .file .file-name').text('404').css('font-size', '30px');
                     $('.file #enckey').addClass('hidden');
                }
                $('.bar-shared').removeClass('loading');
            },
            error: function(xhr, status, e) {
                shared.snackbar.create("Failed to fetch shared file");
            }
        });
    }
    shared.download = function() {
        var type = shared.type;
        var name = shared.name;
        var _id = shared.hashes[0];
        if (shared.deckey == null || shared.deckey.length == 0) {
            shared.snackbar.create("Missing decryption key");
            return;
        }
        $('#enckey').addClass('hidden');
        dl.start(shared.hashes.length > 1 || type == 'folder', [shared.hashes[0]]);
        /*if (shared.hashes.length > 1 || type == 'folder') {
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
        }*/
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
                shared.snackbar.create("Copied file", 'view', 'document.location.href=\'./../browse\'')
            },
            error: function(xhr, status, e) {
                shared.snackbar.create("Failed to copy file");
            }
        });
    }
    shared.askForKey = function() {
        $('#enckey').removeClass('hidden');
    }
    shared.testKey = function() {

    }
    $('#enckey').on('change', function() {
        shared.deckey = btoa(forge.util.hexToBytes($(this).val()));
    })
})(window.shared = window.shared || {}, jQuery);
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
        this.second = true;
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
                        //var f = new DownloadedFolder(this, items[i].name, items[i].hash);
                        var f = new DownloadedFolder(this, items[i].name, items[i].hash, items[i].key, parent.key);
                        parent.addChild(f);
                        this.recursiveAdd(f, items[i].children);
                    } else {
                        //var f = new DownloadedFile(this, items[i].name, items[i].hash, items[i].size);
                        var f = new DownloadedFile(this, items[i].name, items[i].hash, items[i].size, items[i].key, parent.key);
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
                //console.log(this.stopped + " " + shared.simultaneousDownloads + " " + this.started);
                if (this.stopped == shared.simultaneousDownloads || this.stopped == this.started) {
                    console.log("%cFinishing %cdownload","color:red","color:gray");
                    this.stopped = 0;
                    this.started = 0;
                    $('.content a.btn').text('Download');
                    if (dl.numFilesToDownload == 0)
                        shared.snackbar.create("Finished downloading files", 'view', '$(\'#transfers.btn-ctrlbar\').click()');
                    else
                        shared.snackbar.create("Failed to download "+dl.numFilesToDownload+" files", 'view', '$(\'#transfers.btn-ctrlbar\').click()');
                    if (this.ziptree) this.ziptree.zip();
                    else this.save();
                }
            } else {
                console.log("%cStarting %cdecryption and download of DownloadQueue","color:green","color:gray");
                $('.content a.btn').text('Downloading and decrypting...');
                this.next().download();
            }
        }
        this.save = function() {
            this.first.save();
        }
    }
    function DownloadTree(name, hash, key) {
        console.log('adding temp system folder to download tree');
        this.name = name;
        //this.root = new DownloadedFolder(name, '/');
        this.root = new DownloadedFolder(null, name, hash, key, shared.deckey, true);
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
    function DownloadedFile(q, name, hash, size, key, parentKey, single) {
        this.q = q;
        this.id = hash;
        this.name = name;
        this.size = size;
        this.hash = hash;
        this.okey = key;
        this.key = key;
        //if (single) this.key = parentKey;
        this.parentKey = parentKey;
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
                type: "POST",
                url: "./../api/files/view",
                headers: {
                    'X-Foxfile-Auth': api_key
                },
                data: {
                    id: self.hash
                },
                success: function(data, response, xhr) {
                    self.data = data;
                    self.key = xhr.getResponseHeader('X-FoxFile-Key');
                    self.okey = xhr.getResponseHeader('X-FoxFile-Key');
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
            var worker = ww.create('crypto');
            if (!single) {
                worker.emit('aes.decrypt', {
                    content: self.key,
                    key: self.parentKey
                });
            }
            console.log('file name: %c'+this.name,'color:blue');
            console.log('key: %c '+this.key,'color:red');
            console.log('parent: %c'+this.parentKey,'color:red');

            worker.onmessage = function(msg) {
            console.log('decr:%c '+msg[1].data,'color:red');
                var key = msg[1].data;
                var chunks = cr.chunkString(self.data);
                delete self.data;
                var cl = chunks.length;
                console.log('processing '+cl+' chunks');
                var i = 0;
                function process() {
                    //console.log('starting chunk '+(i+1)+' of '+cl);
                    if (i < cl) {
                        worker.emit('aes.decrypt.process', {
                            content: chunks.shift(),
                            key: key
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
                            worker.emit('close');
                            self.data = msg[1].data;
                            $('#transfers .file-list #tfile-'+self.id+' .file-upload-status').text("Waiting");
                            $('#transfers #badge-transfers .badgeval').text(--dl.numFilesToDownload);
                            self.q.start()            
                        }
                    }   
                }   
            }
            worker.onerror = function(e) {
                shared.snackbar.create("Decryption failed");
                $('#enckey').removeClass('hidden').val('');
                $('.content a.btn').text('Download');
                worker.emit('close', {
                    content: 'pls'
                });
            }
            if (single) {
                worker.onmessage([{pls: 'no'}, {data: self.parentKey}]);
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
            $('#transfers .file-list #tfile-'+this.id+' .file-upload-status').text("Done").addClass('upload-success');
        }
        this.addToTransfersPage = function() {
            /*var template = _.template($('#fm-file-transferring').html());
            if ($('#transfers .file-list').hasClass('empty')) {
                $('#transfers .file-list').empty().removeClass('empty');
                $('#transfers .file-list').append('<ul></ul>');
            }
            $('#transfers .file-list ul').append(template(this));
            $('#transfers #badge-transfers').addClass('new');*/
            $('#transfers #badge-transfers .badgeval').text(++dl.numFilesToDownload);
            //dd.numFilesToDisplay++;
        }
    }
    function DownloadedFolder(q, name, hash, key, parentKey, sysf) {
        this.q = q;
        this.name = name;
        this.hash = hash;
        //this.path = path;
        this.okey = key;
        this.parentKey = parentKey;
        console.log('folder name: %c'+this.name,'color:blue');
        if (!sysf && q.second) {
            console.log('second');
            this.key = parentKey;
            q.second = false;
        } else {
            if (sysf)
                this.key = parentKey;
            else 
                this.key = cr.aesDS(key, this.parentKey);
        }
        console.log('key: %c '+key,'color:red');
        console.log('parent: %c'+parentKey,'color:red');
        console.log('decr:%c '+this.key,'color:red');
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
            url: './../api/files/get_public_file_tree',
            headers: {
                'X-Foxfile-Auth': api_key
            },
            data: {
                hashlist: hashlist[0]
            },
            success: function(result, status, xhr) {
                var json = JSON.parse(result);
                if (!isTree(json)) {
                    console.log('single');
                    var q = new DownloadQueue();
                    //var f = new DownloadedFile(q, json[0].name, json[0].hash, json[0].size);
                     var f = new DownloadedFile(q, json[0].name, json[0].hash, json[0].size, json[0].key, shared.deckey, true);
                    f.addToTransfersPage();
                    q.add(f);
                    for (var i = 0; i < shared.simultaneousDownloads; i++) {
                        q.start(null, true);
                    }
                } else {
                    console.log('multi: '+json[0].hash);

                    //var t = new DownloadTree(json[0].name);
                     var t = new DownloadTree(json[0].name, json[0].hash, json[0].key);
                    var q = new DownloadQueue(t);

                    q.recursiveAdd(t.root, json);
                    q.sort();

                    for (var i = 0; i < shared.simultaneousDownloads; i++) {
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
                case 'crypto': return new FoxFileWorker('./../js/ww_crypt.js'+'?'+btoa(cr.randomBytes(2)));
                case 'xhr': return new FoxFileWorker('./../js/ww_xhr.js'+'?'+btoa(cr.randomBytes(2)));
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
    cr.aesE = function(str, pass) {
        // would love to figure out how to use Forge for everything, but I cant figure out how or find any actual documentation
        // and cant figure out how to decrypt anything

        var enc = CryptoJS.AES.encrypt(str, pass);
        //var enc = CryptoJS.AES.encrypt(encodeURIComponent(str), pass);
        //var enc = CryptoJS.AES.encrypt(CryptoJS.enc.Utf16.stringify(CryptoJS.enc.Utf16.parse(str)), pass);
        //return forge.util.encode64(atob(enc.toString()));
        return enc.toString();
        /*return {
            encrypted: enc.toString(),
            enc: enc
        };*/
    }
    cr.aesD = function(b64, key) {
        return CryptoJS.AES.decrypt(b64, key).toString(CryptoJS.enc.Utf8);
        //return decodeURIComponent(CryptoJS.AES.decrypt(b64, key).toString(CryptoJS.enc.Utf8));
        //return CryptoJS.AES.decrypt(b64, key).toString(CryptoJS.enc.Utf16);
        //return CryptoJS.AES.decrypt(b64, key).toString();
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