import XFile from '../classes/XFile';
import XFolder from '../classes/XFolder';

let index = 0;
const createTestData = data => {
	if (data.files !== undefined) {
		let folder = new XFolder(data.name);
		let files = data.files.map(file => createTestData(file));
		folder.index = index++;
		folder.files = files;
		return folder;
	} else {
		let file = new XFile(data.name, 'file');
		file.index = index++;
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
});
const TestFolders = createFolderChain(TestData, [2]);

export {
	TestFolders
};