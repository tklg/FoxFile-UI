import Ajax from './Ajax';
// import fc from 'filecrypt';
// import Util from './Util.js';
import Crypto from './Crypto';

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
				id: file.uuid,
				parent: file.parent
			});
			// console.log(file.parent)
			const parentKey = file.parent.key;
			// console.log('enc: ' + file.key)
			// console.log('enc2: ' + parentKey)
			const {encryptedFilename, encryptedFile, keyString} = await Crypto.encrypt(file, file.key, parentKey);

			const xhr = new XMLHttpRequest();
			xhr.upload.addEventListener('progress', function(e) {
				_this.emit('progress', {
					id: file.uuid,
					parent: file.parent.uuid,
					loaded: e.loaded,
					total: e.total,
				});
			}, false);
			console.log('uploading ' + file.name);
			Ajax.post({
				url: 'api/files',
				xhr: xhr,
				data: {
					name: encryptedFilename,
					parent: file.parent.uuid,
					key: keyString,
					file: encryptedFile ? encryptedFile : undefined,
					folder: encryptedFile ? false : true,
				},
				success(resp, xhr) {
					_this._working--;
					for (let i = 0; i < _this._files.length; i++) {
						if (_this._files[i].parent.uuid === file.uuid) {
							_this._files[i].parent.uuid = JSON.parse(resp).uuid;
						}
					}
					// file.encrypted = true;
					// file.key = keyString;
					file.status = '';
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
				id: file.uuid,
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
