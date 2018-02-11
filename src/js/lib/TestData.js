import XFile from '../classes/XFile';
import XFolder from '../classes/XFolder';
import uuid from 'uuid/v4';
let TreeString = `
img
	favicon.ico
	avatar.jpg
css
	mod
		custom.scss
	style.scss
	colors.scss
js
	index.js
	classes
		Timer.js
		Connect.js
	util.js
.git

index.html
`;

let index = 0;
const createTestData = (data, path) => {
	let id = uuid();
	let nextPath = [...path, id];
	if (data.files !== undefined) {
		let folder = new XFolder(data.name);
		let files = data.files.map((file, i) => createTestData(file, nextPath));
		folder.index = id;
		folder.files = files;
		folder.path = nextPath;
		//index++;
		return folder;
	} else {
		let file = new XFile(data.name, 'file');
		file.path = nextPath;
		file.index = id;
		//index++;
		return file;
	}
}
const createFolderChain = (data, opened) => {
	let folder = data;
	let res = [folder];
	opened = [...opened];
	opened.shift();
	//console.log(folder);
	//console.log(opened);
	for (let index of opened) {
		let tgt = folder.files.find(x => x.index === index);
		if (!tgt) throw "???";
		res.push(tgt);
		if (tgt && tgt.files !== undefined) 
			folder = tgt;
		else break;
	}
	return res;
}
const findFile = (data, index) => {
	// dfs
	if (data.index === index) {
		return data;
	} else {
		let res;
		for (const file of data.files) {
			//console.log(file);
			if (file.index === index) return file;
			else if (file.type === 'folder') {
				res = findFile(file, index);
				if (res) return res;
			}
		}
		return res;
	}
	throw `File with index ${index} does not exist.`;
}
const TestData = createTestData({
	name: 'root',
	files: [
		{
			name: 'test 1.txt',
		},{
			name: 'test 2.txt',
		},{
			name: 'folder 1',
			files: [
				{
					name: 'nested folder 1',
					files: [
						{
							name: 'double nested test 2.txt',
						}
					],
				},{
					name: 'nested test 1.txt',
				},
			],
		},{
			name: 'folder 2',
			files: [
				{
					name: 'nested test 2.txt',
				},
			],
		},
	],
}, []);
console.log(TestData);
const TestFolders = createFolderChain(TestData, []);
//console.log(TestFolders);

export {
	createFolderChain,
	findFile,
	TestData,
	TestFolders,
};