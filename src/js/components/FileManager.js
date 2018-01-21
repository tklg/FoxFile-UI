import React from 'react';
import Folder from '../containers/Folder';
import FilePreview from '../containers/FilePreview';
import MenuFolder from '../containers/MenuFolder';
import Dimensions from '../classes/Dimensions';

const getFolder = (folder, activeIndex, isLeftmost) => (
	<Folder 
		key={folder.index}
		id={folder.index}
		position={folder.position}
		isLeftmost={isLeftmost}
		name={folder.name}
		files={folder.files}
		path={folder.path}
		activeIndex={activeIndex} />
);

const getFilePreview = (folder, isLeftmost) => (
	<FilePreview 
		key={folder.index}
		id={folder.index}
		position={folder.position}
		isLeftmost={isLeftmost}
		name={folder.name}
		files={[]}
		activeIndex={0} />
);

const FileManager = ({shownFolders}) => {
	const maxFolders = Dimensions.maxNumBars;
	const end = shownFolders.length + 1;
	//console.log('window will show ' + maxFolders + " out of " + end + " bars");
	shownFolders.map((folder, i) => {
		let dist = end - i - 2;
		if (dist - 1 >= maxFolders) folder.position = 'hidden-left';
		else folder.position = dist;
	});
	const fmStyle = {
		width: Dimensions.windowWidth,
	};
	const fileContainerStyle = {
		width: end > maxFolders ? Dimensions.windowWidth + Dimensions.uBarWidth : Dimensions.windowWidth,
		right: 0,		
	};
	return (
	<div className="file-manager flex flex-container fc-horizontal" style={fmStyle}>
		<div className="files flex" style={fileContainerStyle}>
		{
			[
			<MenuFolder
				key="menu" 
				user={null} 
				location={null}
				position={end <= maxFolders + 1 ? 0 : 'hidden-left'}
				style={{width: Dimensions.barWidth, height: Dimensions.barHeight}} />,
			...shownFolders.map((folder, i) => {
				let isLeftmost = folder.position === maxFolders - 1;
				if (folder.type === 'folder')
					return getFolder(folder, (shownFolders[i + 1] || {}).index, isLeftmost);
				else 
					return getFilePreview(folder, isLeftmost);
			})]
		}
		</div>
	</div>
	);
}

export default FileManager;
