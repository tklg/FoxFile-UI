import XFile from './XFile';
import {XFSException} from '../exceptions';

class XFolder extends XFile {
	constructor(name) {
		super(name, 'folder');
		this._files = [];
	}
	get files() {
		return this._files;
	}
	set files(files) {
		this._files = files;
	}
	addFile(file) {
		if (!file instanceof XFile) throw new XFSException('XFolder can only contain instances of XFile, instead got ' + file);
		this._files.push(file);
	}
}

export default XFolder;