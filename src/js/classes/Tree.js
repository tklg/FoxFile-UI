class Tree {
	constructor(root) {
		this.data;
		this.root = new Node(root, 'My files');
		this.root.data.encrypted = false;
		this.root.data.folder = true;
	}
	import(data) {
		if (!(data instanceof Array)) throw new Error('Imported tree data must be an array');

		// https://stackoverflow.com/questions/444296/how-to-efficiently-build-a-tree-from-a-flat-structure
		
		const lookup = [this.root];

		for (const item of data) {
			let existing = lookup.find(node => node.data.uuid === item.uuid);
			if (existing) { // parent folder node already exists, populate its data
				existing.data.name = item.name;
				existing.data.key = item.key;
				existing.data.created = new Date(item.created);
				existing.data.lastmod = new Date(item.lastmod);
				existing.data.shared = !!+item.shared;
				existing.data.trashed = !!+item.trashed;
				existing.data.folder = !!+item.folder;	
			} else { // create a new lookup point
				existing = new Node(item.uuid, item.name);
				existing.data.parent = item.parent_uuid;
				existing.data.key = item.key;
				existing.data.size = +item.size;
				existing.data.created = new Date(item.created);
				existing.data.lastmod = new Date(item.lastmod);
				existing.data.shared = !!+item.shared;
				existing.data.trashed = !!+item.trashed;
				existing.data.folder = !!+item.folder;
				lookup.push(existing);
			}

			let parent = lookup.find(node => node.data.uuid === item.parent_uuid);
			if (!parent) {
				parent = new Node(item.parent_uuid, null);
				lookup.push(parent);
			} else {
				parent.addChild(existing);
				existing.parentNode = parent;
			}
		}

		return this.root;
	}
	importDropped(files, parent) {
		parent = this.get(parent);
		for (const file of files) {
			const node = new Node(file.uuid, file.name);
			node.data.status = 'upload';
			node.data.encrypted = false;
			node.data.parent = parent.id;
			node.parentNode = parent;
			if (file.file) {
				node.data.file = file.file;
				node.data.size = file.file.size;
				node.data.folder = false;
			} else {
				node.data.folder = true;
			}
			parent.addChild(node);
			if (!file.file) this.importDropped(file.children, file.uuid);
		}
	}
	add(parentUuid, subTree) {
		if (!(subTree instanceof Node)) throw new Error('subTree must be a Tree::Node');
		const parent = this.root.get(parentUuid);
		parent.addChild(subTree);
	}
	async map(func) {
		await this.root.map(func);
	}
	find(func) {
		return this.root.find(func);
	}
	get(uuid) {
		return this.root.find(node => node.uuid === uuid);
	}
	has(uuid) {
		return !!this.get(uuid);
	}
	static flatten(children, res = []) {
	    for (const item of children) {
	    	res.push(item.data);
	        if (item.children && item.children.length) Tree.flatten(item.children, res);
	    }
	    return res;
	}
}

class Node {
	constructor(uuid, name) {
		this.data = {};
		this.data.uuid = uuid;
		this.data.name = name;
		this.data.encrypted = true;
		this.data.status = '';
		const k = ['created', 'file', 'folder', 'key', 'lastmod', 'parent', 'shared', 'size', 'trashed'];
		for (const key of k) {
			this.data[key] = null;
		}
		const j = ['position', 'isLast'];
		for (const key of j) {
			this.data[key] = null;
		}
		this.children = [];
		this.parentNode = null;
	}
	addChild(node) {
		if (!(node instanceof Node)) throw new Error('node must be a Tree::Node');
		this.children.push(node);
	}
	async map(func) {
		this.data = func.bind(this)(this.data);
		if (this.data instanceof Promise) this.data = await this.data;
		for (const c of this.children) {
			await c.map(func);
		}
	}
	find(func) {
		if (func(this.data)) return this;
		for (const c of this.children) {
			let res;
			if ((res = c.find(func)) !== null) {
				return res;
			}
		}
		return null;
	}
	get position() {
		return this.data ? this.data.position : 0;
	}
	set position(n) {
		this.data.position = n;
	}
	get isLast() {
		return this.data ? this.data.isLast : false;
	}
	set isLast(b) {
		this.data.isLast = b;
	}
	get id() {
		return this.data ? this.data.uuid : '';
	}
	set id(id) {
		if (this.data) this.data.uuid = id;
	}
	get name() {
		return this.data ? this.data.name : '';
	}
	get path() {
		let path = [this.id];
		let parent = this.parentNode;
		while (parent) {
			path = [parent.id, ...path];
			parent = parent.parentNode;
		}
		return path;
	}
	get type() {
		return this.data && this.data.folder ? 'folder' : 'file';
	}
	get files() {
		return this.children;
	}
}

export default Tree;
