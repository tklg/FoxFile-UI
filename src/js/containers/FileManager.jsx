import React from 'react';
import Folder, {FolderPlaceholder} from './Folder.jsx';
import {scrollTo} from '../actions/sidescroll';
import FilePreview from './FilePreview.jsx';
import MenuFolder from './MenuFolder.jsx';
import Dimensions from '../classes/Dimensions';

const getFolder = (folder, activeIndex, isLeftmost, numShown, dragging, dispatch) => (
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
		activeIndex={activeIndex}
		dragging={dragging}
		dispatch={dispatch} />
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

class FileManager extends React.Component {
	constructor() {
		super();
		this.menuFolderElems = [{
			name: 'Files',
			onClick: () => {
				this.props.dispatch(scrollTo(this.props.folders[0].path));
			}
		},{
			name: 'Trash',
			onClick: () => {
				
			}
		},{
			name: 'File transfers',
			onClick: () => {
				
			}
		}];
	}
	render() {
		const {folders, scrolling} = this.props;
		const maxFolders = Dimensions.maxNumBars;
		const end = folders.length + 1;
		//console.log('window will show ' + maxFolders + " out of " + end + " bars");
		//console.log(folders);
		folders.map((folder, i) => {
			let dist = end - i - 2;
			/*if (dist - 1 >= maxFolders) folder.position = maxFolders;
			else folder.position = dist;*/
			folder.position = dist;
			folder.isLast = false;
		});
		folders[folders.length - 1].isLast = true;
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
			left: maxFolders >= folders.length + 1 ? 0 : -Dimensions.barWidth,
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
					style={menuFolderStyle}
					elems={this.menuFolderElems}
					dispatch={this.props.dispatch} />,

				...folders.map((folder, i) => {
					let isLeftmost = folder.position === maxFolders - 1;
					if (false && scrolling.diff !== 0 && scrolling.direction === 'add' && i === folders.length - 1) {
						//console.log(scrolling.folders);
						return getPlaceholder(folder);
					} else {
						if (folder.type === 'folder') {
							return getFolder(folder, (folders[i + 1] || {}).id, isLeftmost, folders.length, this.props.dragging, this.props.dispatch);
						} else {
							return getFilePreview(folder, isLeftmost, folders.length);
						}
					}
				}).concat(placeholdersForFolderRemoval)
				]
			}
			</div>
		</div>
		);
	}
}

export default FileManager;