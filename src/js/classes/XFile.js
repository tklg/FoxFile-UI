class XFile {
	constructor(name, type) {
		this._index = -1;
		this._name = name;
		this._type = type;
		this._position = 0;
		this._path = [];
	}
	get index() {
		return this._index;
	}
	set index(index) {
		this._index = index;
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
	get path() {
		return this._path;
	}
	set path(path) {
		this._path = path;
	}
}

export default XFile;