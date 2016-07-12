importScripts('./forge.min.js','./crypto-js.min.js','./underscore.min.js');

// a webworker for async encryption/decryption

var basekey = null;
var privkey = null;
var pubkey = null;
var cryptor = null;
var iv = null;
var ivLength = 24;
var buffer = null;

this.onmessage = function(e) {
	var type = e.data[0];
	if (e.data[1])
		var data = e.data[1];

	if (data && data.content) {
		if (data.content instanceof ArrayBuffer) {
			console.log("is an ArrayBuffer");
			data.content = cr.bufferToWord(data.content);
		}
	}

	switch (type) {
		case 'init':
			basekey = data.basekey;
			privkey = data.privkey;
			pubkey = data.pubkey;
			break;
		/*case 'cryptor.init':
			self.cryptor = 
			break;*/
		case 'aes.encrypt':
			emit('success', {
				msg: 'aes encryption done',
				data: cr.aesES(data.content, data.key)
			});
			break;
		case 'aes.decrypt':
			emit('success', {
				msg: 'aes decryption done',
				data: cr.aesDS(data.content, data.key)
			});
			break;
		case 'aes.encrypt.process':
			var addiv = false;
			if (!iv) {
				iv = CryptoJS.lib.WordArray.random(ivLength / 3 * 2);
				addiv = true;
			}
			if (!cryptor) cryptor = CryptoJS.algo.AES.createEncryptor(data.key, {iv: iv});
			cr.aesE(data.content, data.key, function(data) {
				emit('success', {
					msg: 'aes part encryption done',
					//iv: iv.toString(CryptoJS.enc.Base64),
					data: ''//(addiv ? iv.toString(CryptoJS.enc.Base64) : '') + data
				});
			});
			break;
		case 'aes.decrypt.process':
			if (!iv) {
				iv = CryptoJS.enc.Base64.parse(data.content.substr(0, ivLength));
				data.content = data.content.substr(ivLength);
				//iv = CryptoJS.enc.Base64.parse(data.iv);
			}
			if (!cryptor) cryptor = CryptoJS.algo.AES.createDecryptor(data.key, {iv: iv});
			cr.aesD(data.content, data.key, function(data) {
				emit('success', {
					msg: 'aes part decryption done',
					data: ''//data
				});
			});
			break;
		case 'aes.encrypt.finalize':
			buffer.concat(cryptor.finalize());
			emit('success', {
				msg: 'aes encryption done',
				data: iv.toString(CryptoJS.enc.Base64) + buffer.toString(CryptoJS.enc.Base64)
			});
			iv = null;
			cryptor = null;
			buffer = null;
			break;
		case 'aes.decrypt.finalize':
			buffer.concat(cryptor.finalize());
			emit('success', {
				msg: 'aes decryption done',
				data: buffer.toString(CryptoJS.enc.Utf8)
			});
			iv = null;
			cryptor = null;
			buffer = null;
			break;
		case 'rsa.encrypt':
			emit('success', {
				msg: 'rsa encryption done',
				data: cr.rsaE(data.content)
			});
			break;
		case 'rsa.decrypt':
			emit('success', {
				msg: 'rsa decryption done',
				data: cr.rsaD(data.content)
			});
			break;
		case 'cancel':
		case 'reset':
			iv = null;
			cryptor = null;
			buffer = null;
			break;
		case 'close':
			self.close();
			break;
		default:
			emit("error", {msg: "Invalid action"});
			break;
	}
}
function chunkString(str) {
    return str.match(/(.|[\r\n]){1,8192}/g);
}
function mapper(k) {
 	return parseInt(k, null);
}
function sorter(a, b) {
    return a - b;
}
var cr = {
	bufferToWord: function(buffer) {
        return CryptoJS.lib.WordArray.create(buffer);
    },
	aesE: function(str, key, cb) {
        /*var iv = CryptoJS.lib.WordArray.random(ivLength / 3 * 2);
        var en = CryptoJS.algo.AES.createEncryptor(key, {iv: iv});
        var chunks = chunkString(str);
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
        cb(iv.toString(CryptoJS.enc.Base64) + enc.toString(CryptoJS.enc.Base64))'*/
        if (!buffer) {
        	buffer = cryptor.process(CryptoJS.enc.Utf8.parse(str));
        	cb(buffer);
        	return;
        } else {
        	cb(buffer.concat(cryptor.process(CryptoJS.enc.Utf8.parse(str))));
        	return;
        }
    },
    aesD: function(str, key, cb) {
        /*var iv = CryptoJS.enc.Base64.parse(str.substr(0, ivLength));
        var chunks = chunkString(str.substr(ivLength));
        delete str;
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
        cb(enc.toString(CryptoJS.enc.Utf8));*/
        if (!buffer) {
        	buffer = cryptor.process(CryptoJS.enc.Base64.parse(str));
        	cb(buffer);
        	return;
        } else {
        	cb(buffer.concat(cryptor.process(CryptoJS.enc.Base64.parse(str))));
        	return;
        }
    },
    aesES: function(str, key) {
    	return CryptoJS.AES.encrypt(str, key).toString();
    },
    aesDS: function(str, key) {
    	return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
    },
    rsaE: function(str) {
        var privk = forge.pki.decryptRsaPrivateKey(self.privkey, self.basekey);
        var buf = forge.util.createBuffer(str, 'utf8');
        var enc = forge.pki.rsa.encrypt(buf.getBytes(), privk, 0x01);;
        return forge.util.encode64(enc);
    },
    rsaD: function(str) {
        var str = forge.util.decode64(str);
        var pubk = forge.pki.publicKeyFromPem(self.pubkey);
        var buf = forge.util.createBuffer(str);
        var dec = forge.pki.rsa.decrypt(buf.getBytes(), pubk, 0x01);
        return dec;
    }
}
function emit(type, msg) {
	this.postMessage([type, msg]);
}
var Queue = function(cryptor, onfinish) {
	this.cryptor = cryptor;
	this.onfinish = onfinish;
	this.queue = [];
	this.enc = null;
	this.add = function(chunk) {
		//console.log("adding part to queue");
		this.queue.push(chunk);
	}
	this.start = function() {
		if (this.queue.length == 0) {
			this.enc.concat(this.cryptor.finalize());
			this.finish();
		} else {
			//console.log('processing chunk: '+this.queue.length+" chunks left");
		    var next = null;
		    var wait = null;
		    var _this = this;
		    wait = function() {
		    	//console.log('next: '+(next?'string':'null'));
		    	if (next) {
		    		//console.log('leaving');
		    		if (!_this.enc) _this.enc = next;
		            else _this.enc.concat(next);
		    		//console.log(_this.enc);
		    		next = null;
		    		wait = null;
		    		_this.start();
		    	} else {
		    		//console.log('checking');
		    		setTimeout(function() {
		    			wait();
		    		}, 100);
		    	}
		    };
		    next = this.cryptor.process(this.next());
		    //console.log('next: '+(next?'string':'null'));
		    wait();
		}
	}
	this.next = function() {
		return this.queue.shift();
		//return this.cryptor.process(this.queue.shift());
	}
	this.finish = function() {
		console.log('finishing queue');
		this.onfinish(this.enc);
	}
}