class XFile {
	constructor(name, type = 'file') {
		this._id = -1;
		this._name = name;
		this._type = type;
		this._position = 0;
		this._isLast = false;
		this._path = [];
	}
	get id() {
		return this._id;
	}
	set id(id) {
		this._id = id;
	}
	get name() {
		return this._name;
	}
	set name(name) {
		this._name = name;
	}
	get type() {
		return this._type;
	}
	set type(type) {
		this._type = type;
	}
	get position() {
		return this._position;
	}
	set position(position) {
		this._position = position;
	}
	set isLast(bool) {
		this._isLast = bool;
	}
	get isLast() {
		return this._isLast;
	}
	get path() {
		return this._path;
	}
	set path(path) {
		this._path = path;
	}
}

export default XFile;