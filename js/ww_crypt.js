importScripts('./forge.min.js','./crypto-js.min.js');

// a webworker for async encryption/decryption

this.basekey = null;
this.privkey = null;
this.pubkey = null;

var self = this;

this.onmessage = function(e) {
	var type = e.data[0];
	var data = e.data[1];

	if (data.content) {
		if (data.content instanceof ArrayBuffer) {
			console.log("is an ArrayBuffer");
			data.content = cr.bufferToWord(data.content);
		}
	}

	switch (type) {
		case 'init':
			self.basekey = data.basekey;
			self.privkey = data.privkey;
			self.pubkey = data.pubkey;
			break;
		case 'aes.encrypt':
			emit('success', {
				msg: 'aes encryption done',
				data: cr.aesE(data.content, data.key)
			});
			break;
		case 'aes.decrypt':
			emit('success', {
				msg: 'aes decryption done',
				data: cr.aesD(data.content, data.key)
			});
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
		case 'close':
			self.close();
			break;
		default:
			emit("error", {msg: "Invalid action"});
			break;
	}
}

var cr = {
	bufferToWord: function(buffer) {
        return CryptoJS.lib.WordArray.create(buffer);
    },
	aesE: function(str, pass) {
        var enc = CryptoJS.AES.encrypt(str, pass);
        //var enc = CryptoJS.AES.encrypt(encodeURIComponent(str), pass);
        //var enc = CryptoJS.AES.encrypt(CryptoJS.enc.Utf16.stringify(CryptoJS.enc.Utf16.parse(str)), pass);
        //return forge.util.bytesToHex(atob(enc.toString()));
        return enc.toString();
    },
    aesD: function(b64, key) {
        return CryptoJS.AES.decrypt(b64, key).toString(CryptoJS.enc.Utf8);
        //return decodeURIComponent(CryptoJS.AES.decrypt(b64, key).toString(CryptoJS.enc.Utf8));
        //return CryptoJS.AES.decrypt(b64, key).toString(CryptoJS.enc.Utf16);
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