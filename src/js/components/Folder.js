import React from 'react';
import FolderItem from '../containers/FolderItem';
import {List} from 'react-virtualized';
import Dimensions from '../classes/Dimensions';
import {scrollLeft, scrollTo} from '../actions/sidescroll';
import {dragEnter, dragLeave, dragDrop} from '../actions/dragdrop';

const rowRenderer = ({key, index, isScrolling, isVisible, style, content, active}) => {
	const item = content[index];
	return (
	<FolderItem 
		key={key} 
		style={style} 
		id={item.id}
		item={item} 
		selected={active === item.id} />
	);
}

let Folder = ({id, name, position, files, activeIndex, onBackClick, onHeaderClick, numShown, isLeftmost, isLast, dragging, onDragEnter, onDragLeave, onDrop}) => {
	const maxFolders = Dimensions.maxNumBars;
	const dist = maxFolders - position - 1;
	const isDragging = dragging.id === id && dragging.type === 'folder';
	let left;
	if (position > maxFolders - 1) left = -Dimensions.barWidth;
	else left = dist * Dimensions.barWidth;
	// if there are not enough bars to fill the screen
	if (numShown < maxFolders) {
		left = (numShown - position) * Dimensions.barWidth;
	}
	const folderStyle = {
		width: isLast ? null : Dimensions.barWidth, 
		height: Dimensions.barHeight,
		left: left,
		right: isLast ? 0 : null,
	};
	return (<div 
		className={"folder" + (isLast ? ' folder-last' : '') + (isDragging ? ' dragging' : '')} 
		data-id={id} 
		style={folderStyle}
		onDragOver={(e) => {
			if (!isDragging) {
				onDragEnter(e)
			}
		}}
        onDragLeave={(e) => {
			if (isDragging) {
				onDragLeave(e)
			}
		}}
		onDrop={(e) => {
			if (isDragging) {
				onDrop(e)
			}
		}} >
		<header className="flex-container fc-horizontal" onClick={onHeaderClick}>
			<button className={isLeftmost ? 'leftmost' : ''} onClick={onBackClick}>‹</button>
			<h1 className="flex">{id + ": " + name + " (" + position + ")"}</h1>
			<div className="bottom-border"><div className="indeterminate"></div></div>
		</header>
		<List 
			className="scroller"
			width={Dimensions.barWidth}
			height={Dimensions.barHeight - 50}
			rowCount={files.length}
			rowHeight={40}
			rowRenderer={(args) => rowRenderer({...args, content: files, active: activeIndex})}
		/>
	</div>);
};

let FolderPlaceholder = ({id, position}) => (
	<section 
		className={"folder-placeholder" + (position === 'hidden-left' ? ' hidden' : '')} 
		data-id={id} 
		style={{width: 0, height: Dimensions.barHeight}}>
	</section>
);

export default Folder;
export {FolderPlaceholder};
