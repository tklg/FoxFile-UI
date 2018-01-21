import XFile from '../classes/XFile';
import XFolder from '../classes/XFolder';
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
	if (data.files !== undefined) {
		let folder = new XFolder(data.name);
		let files = data.files.map((file, i) => createTestData(file, [...path, i]));
		folder.index = index++;
		folder.files = files;
		folder.path = path;
		return folder;
	} else {
		let file = new XFile(data.name, 'file');
		file.index = index++;
		file.path = path;
		return file;
	}
}
const createFolderChain = (data, opened) => {
	let folder = data;
	let res = [folder];
	for (let level of opened) {
		res.push(folder.files[level]);
		if (folder.files && folder.files[level] && folder.files[level].files !== undefined) 
			folder = folder.files[level];
		else break;
	}
	return res;
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
const TestFolders = createFolderChain(TestData, []);

export {
	createFolderChain,
	TestData,
	TestFolders,
};