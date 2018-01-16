import React from 'react';
import Folder from '../containers/Folder';
import FilePreview from '../containers/FilePreview';
import MenuFolder from '../containers/MenuFolder';

const getFolder = (folder, activeIndex) => (
	<Folder 
		key={folder.index}
		id={folder.index}
		name={folder.name}
		files={folder.files}
		activeIndex={activeIndex} />
);

const getFilePreview = (folder) => (
	<FilePreview 
		key={folder.index}
		id={folder.index}
		name={folder.name}
		files={[]}
		activeIndex={0} />
);

const FileManager = ({shownFolders}) => (
	<div className="file-manager flex flex-container fc-horizontal">
		<MenuFolder />
		<div className="files flex">
		{
			shownFolders.map((folder, i) => {
				if (folder.type === 'folder')
					return getFolder(folder, (shownFolders[i + 1] || {}).index);
				else 
					return getFilePreview(folder);
			})
		}
		</div>
	</div>
)

export default FileManager;
