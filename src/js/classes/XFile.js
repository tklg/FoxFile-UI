class XFile {
	constructor(name, type) {
		this._index = -1;
		this._name = name;
		this._type = type;
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
}

export default XFile;