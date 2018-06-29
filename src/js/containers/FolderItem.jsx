import {scrollTo} from '../actions/sidescroll';
import {dragEnter, dragLeave, dragDrop} from '../actions/dragdrop';
import React from 'react';

class FolderItem extends React.Component {
	constructor() {
		super();
		this.onClick = this.onClick.bind(this);
		this.onDragEnter = this.onDragEnter.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);
		this.onDrop = this.onDrop.bind(this);
	}
	onClick() {
		this.props.dispatch(scrollTo(this.props.item.path));
	}
	onDragEnter(e) {
        if (e) {
        	e.preventDefault();
        	e.stopPropagation();
    	}
        //if (!e.currentTarget.classList.contains('file')) return;
        //console.log('entered ' + e.currentTarget.classList.toString());
        this.props.dispatch(dragEnter(this.props.id, 'file'));
    }
    onDragLeave(e) {
        if (e) {
        	e.preventDefault();
        	e.stopPropagation();
    	}
        //if (!e.currentTarget.classList.contains('file')) return;
        //console.log('left ' + e.currentTarget.classList.toString());
        this.props.dispatch(dragLeave(this.props.id, 'file'));
    }
    onDrop(e) {
    	console.log(e)
    	e.preventDefault();
    	e.stopPropagation();
        var nFiles = (e.dataTransfer || {}).files || e.target.files;
        var files = [];
        for (var i = 0; i < nFiles.length; i++) {
            files.push(nFiles.item(i));
        }
        this.props.dispatch(dragDrop(this.props.id, files));
    }
	render() {
		const {id, item, style, selected, onClick, dragging} = this.props;
		const isDragging = item.type === 'folder' && dragging.id === id && dragging.type === 'file';

		return (<div 
			className={"file" + (selected ? ' selected' : '') + (isDragging ? ' dragging' : '')}
			style={style}
			data-type={item.type}
			data-id={item.id}
			onClick={this.onClick}
			onDragOver={(e) => {
				if (e) e.preventDefault();
				if (!isDragging && item.type === 'folder') {
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
			{/*item.id + ": " + item.name*/}
			{item.name}
		</div>);
	}
}

export default FolderItem;