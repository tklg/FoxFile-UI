//import {connect} from 'react-redux';
import {scrollLeft, scrollTo} from '../actions/sidescroll';
import {dragEnter, dragLeave, dragDrop} from '../actions/dragdrop';
//import _Folder, {FolderPlaceholder} from '../components/Folder';
import Dimensions from '../classes/Dimensions';
import FolderItem from './FolderItem.jsx';
import {List} from 'react-virtualized';
import React from 'react';

const rowRenderer = ({dispatch, key, index, isScrolling, isVisible, style, content, active, dragging}) => {
	const item = content[index];
	return (
	<FolderItem 
		key={key} 
		style={style} 
		id={item.id}
		item={item} 
		selected={active === item.id}
		dragging={dragging}
		dispatch={dispatch} />
	);
}

class Folder extends React.Component {
	constructor() {
		super();

		this.onBackClick = this.onBackClick.bind(this);
		this.onHeaderClick = this.onHeaderClick.bind(this);
		this.onDragEnter = this.onDragEnter.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);
		this.onDrop = this.onDrop.bind(this);
	}
	onBackClick(e) {
		e.stopPropagation();
		this.props.dispatch(scrollLeft());
	}
	onHeaderClick(e) {
		e.stopPropagation();
		this.props.dispatch(scrollTo(this.props.path));
	}
	onDragEnter(e) {
		if (e) {
        	e.preventDefault();
        	e.stopPropagation();
    	}
		//if (!e.currentTarget.classList.contains('folder')) return;
       	//console.log('entered ' + e.currentTarget.classList.toString());
        //e.nativeEvent.stopImmediatePropagation();
        this.props.dispatch(dragEnter(this.props.id, 'folder'));
    }
    onDragLeave(e) {
    	if (e) {
        	e.preventDefault();
        	e.stopPropagation();
    	}
    	//if (!e.currentTarget.classList.contains('folder')) return;
        //console.log('left ' + e.currentTarget.classList.toString());
        //e.nativeEvent.stopImmediatePropagation();
        this.props.dispatch(dragLeave(this.props.id, 'folder'));
    }
    onDrop(e) {
    	e.preventDefault();
    	e.stopPropagation();
        this.props.dispatch(dragDrop(this.props.id, e));
    }
	render() {
		const {id, name, position, files, activeIndex, onBackClick, onHeaderClick, numShown, isLeftmost, isLast, dragging} = this.props;
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
				if (e) e.preventDefault();
				if (!isDragging) {
					this.onDragEnter(e)
				}
			}}
	        onDragLeave={(e) => {
				if (isDragging) {
					this.onDragLeave(e)
				}
			}}
			onDrop={(e) => {
				if (isDragging) {
					this.onDrop(e)
				}
			}} >
			<header className="flex-container fc-horizontal" onClick={this.onHeaderClick}>
				<button className={isLeftmost ? 'leftmost' : ''} onClick={this.onBackClick}>‹</button>
				{/*<h1 className="flex">{id + ": " + name + " (" + position + ")"}</h1>*/}
				<h1 className="flex">{name}</h1>
				<div className="bottom-border"><div className="indeterminate"></div></div>
			</header>
			<List 
				className="scroller"
				width={Dimensions.barWidth}
				height={Dimensions.barHeight - 50}
				rowCount={files.length}
				rowHeight={40}
				rowRenderer={(args) => rowRenderer({...args, content: files, active: activeIndex, dispatch: this.props.dispatch, dragging: this.props.dragging})}
			/>
		</div>);
	}
}

let FolderPlaceholder = ({id, position}) => (
	<section 
		className={"folder-placeholder" + (position === 'hidden-left' ? ' hidden' : '')} 
		data-id={id} 
		style={{width: 0, height: Dimensions.barHeight}}>
	</section>
);

export default Folder;
export {FolderPlaceholder};