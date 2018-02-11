import React from 'react';
import {connect} from 'react-redux';
import Dimensions from '../classes/Dimensions';

let FilePreview = ({id, name, file, position, numShown, isLeftmost, isLast}) => {
	const maxFolders = Dimensions.maxNumBars;
	const dist = maxFolders - position - 1;
	let left;
	if (position > maxFolders - 1) left = -Dimensions.barWidth;
	else left = dist * Dimensions.barWidth;
	if (numShown < maxFolders) {
		left = (numShown - position) * Dimensions.barWidth;
	}
	const folderStyle = {
		width: isLast ? null : Dimensions.barWidth, 
		height: Dimensions.barHeight,
		left: left,
		right: isLast ? 0 : null,
	};
	return (
	<div 
		className={"folder" + (isLast ? ' folder-last' : '')}
		data-id={id}
		style={folderStyle}>
		<header className="flex-container fc-horizontal">
			<button className={isLeftmost ? 'leftmost' : ''}>‹</button>
			<h1 className="flex">{id + ": " + name}</h1>
			<div className="bottom-border"><div className="indeterminate"></div></div>
		</header>
	</div>);
};

FilePreview = connect()(FilePreview);

export default FilePreview;