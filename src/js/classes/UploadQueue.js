import Ajax from './Ajax';
import fc from 'filecrypt';

// https://github.com/diafygi/webcrypto-examples#aes-gcm---importkey

class UploadQueue {
	constructor(max) {
		this._files = [];
		this._funcs = {};
		this._working = 0;
		this._uploads = 0;
		this._maxWorking = max || 1;
	}
	add(file) {
		if (file instanceof Array) {
			this._files = this._files.concat(file);
			this._uploads += file.length;
		} else {
			this._files.push(file);
			this._uploads++;
		}
		this.upload();
	}
	async upload() {
		if (this._working < this._maxWorking && this._files.length) {
			this._working++;
			this.upload();
		} else {
			return;
		}
		const _this = this;
		const file = this._files.shift();
		try {

			this.emit('encrypt', {
				id: file.id,
				parent: file.parent
			});

			const parentKey = await fc.importPassword('foxfoxfox');
			const key = await fc.generateKey();
			const enc = new TextDecoder('utf-8');
			const {iv, result} = await fc.encrypt(key, file.file);
			const encryptedCombinedBuffer = fc.mergeIvAndData(iv.buffer, result);
			const encryptedFile = fc.ab2file(encryptedCombinedBuffer);
			const keyBuf = await fc.wrapKey(key, parentKey);
			const keyString = enc.decode(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key));

			//this._working++;
			const xhr = new XMLHttpRequest();
			xhr.upload.addEventListener('progress', function(e) {
				_this.emit('progress', {
					id: file.id,
					parent: file.parent,
					loaded: e.loaded,
					total: e.total,
				});
			}, false);
			console.log('uploading ' + file.file.name);
			Ajax.post({
				url: 'api/files',
				xhr: xhr,
				data: {
					parent: file.parent,
					file: encryptedFile,
					key: keyString,
				},
				success(resp, xhr) {
					_this._working--;
					_this.emit('upload', resp);
					if (!_this._files.length && !_this._working) {
						_this.emit('done', _this._uploads);
						_this._uploads = 0;
					}
					_this.upload();
				},
				error(resp, xhr) {
					
					_this._working--;
					_this.emit('error', resp);
				}
			});
		} catch (e) {
			console.error(e)
			this.emit('error', {
				id: file.id,
				error: e,
			});
		}
	}
	on(event, func) {
		if (!event instanceof String) throw new Error('event must be string');
		if (!func instanceof Function) throw new Error('func must be a function');
		if (!this._funcs[event]) this._funcs[event] = [];
		if (!this._funcs[event].includes(func)) this._funcs[event].push(func);
	}
	off(event, func) {
		for (const i in this._funcs[event]) {
			if (this._funcs[event][i] === func) {
				this._funcs[event].splice(i, 1);
			}
		}
	}
	offAll(event) {
		this._funcs[event] = [];
	}
	emit(event, data) {
		let fns = this._funcs[event];
		if (!fns) return;
		for (const fn of fns) {
			try {
				fn(data);
			} catch (e) {
				console.error(e);
			}
		}
	}
}

const Queue = new UploadQueue();

export default Queue;
