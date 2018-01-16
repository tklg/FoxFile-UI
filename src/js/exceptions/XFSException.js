let MESSAGE = Symbol('message');

class XFSException {
	constructor(message) {
		this[MESSAGE] = message;
	}
	toString() {
		return this[MESSAGE];
	}
}

export default XFSException;