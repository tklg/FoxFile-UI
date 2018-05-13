import Ajax from './Ajax';

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
	upload() {
		if (this._working < this._maxWorking && this._files.length) {
			this._working++;
			this.upload();
		} else {
			return;
		}
		//this._working++;
		const _this = this;
		const file = this._files.shift();
		const xhr = new XMLHttpRequest();
		xhr.upload.addEventListener('progress', function(e) {
			_this.emit('progress', {
				parent: file.parent,
				loaded: e.loaded,
				total: e.total,
			});
		}, false);
		console.log('uploading ' + file.file);
		Ajax.post({
			url: 'api/file',
			xhr: xhr,
			data: {
				parent: file.parent,
				file: file.file,
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
