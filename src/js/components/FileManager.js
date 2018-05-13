import React from 'react';
import Folder, {FolderPlaceholder} from '../containers/Folder';
import FilePreview from '../containers/FilePreview';
import MenuFolder from '../containers/MenuFolder';
import Dimensions from '../classes/Dimensions';

const getFolder = (folder, activeIndex, isLeftmost, numShown) => (
	<Folder 
		key={folder.id}
		id={folder.id}
		position={folder.position}
		numShown={numShown}
		isLeftmost={isLeftmost}
		isLast={folder.isLast}
		name={folder.name}
		files={folder.files}
		path={folder.path}
		activeIndex={activeIndex} />
);

const getFilePreview = (folder, isLeftmost, numShown) => (
	<FilePreview 
		key={folder.id}
		id={folder.id}
		position={folder.position}
		numShown={numShown}
		isLeftmost={isLeftmost}
		isLast={folder.isLast}
		name={folder.name}
		files={[]}
		activeIndex={0} />
);

const getPlaceholder = (folder) => (
	<FolderPlaceholder 
		key={folder.id} 
		id={folder.id} 
		position={folder.position} />
);

const FileManager = ({shownFolders, scrolling}) => {
	const maxFolders = Dimensions.maxNumBars;
	const end = shownFolders.length + 1;
	//console.log('window will show ' + maxFolders + " out of " + end + " bars");
	//console.log(shownFolders);
	shownFolders.map((folder, i) => {
		let dist = end - i - 2;
		/*if (dist - 1 >= maxFolders) folder.position = maxFolders;
		else folder.position = dist;*/
		folder.position = dist;
		folder.isLast = false;
	});
	shownFolders[shownFolders.length - 1].isLast = true;
	const fmStyle = {
		width: Dimensions.windowWidth,
	};
	const fileContainerStyle = {
		//width: end > maxFolders ? Dimensions.windowWidth + Dimensions.uBarWidth : Dimensions.windowWidth,
		width: Dimensions.windowWidth,
		right: 0,	
	};
	const menuFolderStyle = {
		width: Dimensions.barWidth, 
		height: Dimensions.barHeight,
		left: maxFolders >= shownFolders.length + 1 ? 0 : -Dimensions.barWidth,
	};
	let placeholdersForFolderRemoval = [];
	if (scrolling.diff !== 0 && scrolling.direction === 'remove') {
		//placeholdersForFolderRemoval = scrolling.folders.map(getPlaceholder);
		// placeholdersForFolderRemoval = getPlaceholder(scrolling.folders[0]);
		//console.log(scrolling.folders);
	}
	return (
	<div className={"file-manager flex flex-container fc-horizontal" + (scrolling.diff !== 0 ? ' scrolling' : '')} style={fmStyle}>
		<div className="files flex" style={fileContainerStyle}>
		{
			[
			<MenuFolder
				key="menu" 
				user={null} 
				location={null}
				position={end <= maxFolders + 1 ? 0 : maxFolders}
				style={menuFolderStyle} />,

			...shownFolders.map((folder, i) => {
				let isLeftmost = folder.position === maxFolders - 1;
				if (false && scrolling.diff !== 0 && scrolling.direction === 'add' && i === shownFolders.length - 1) {
					//console.log(scrolling.folders);
					return getPlaceholder(folder);
				} else {
					if (folder.type === 'folder') {
						return getFolder(folder, (shownFolders[i + 1] || {}).id, isLeftmost, shownFolders.length);
					} else {
						return getFilePreview(folder, isLeftmost, shownFolders.length);
					}
				}
			}).concat(placeholdersForFolderRemoval)
			]
		}
		</div>
	</div>
	);
}

export default FileManager;
