import React from 'react';

const FolderItem = ({id, item, style, selected, onClick, dragging, onDragEnter, onDragLeave, onDrop}) => {

	const isDragging = item.type === 'folder' && dragging.id === id && dragging.type === 'file';

	return (<div 
		className={"file" + (selected ? ' selected' : '') + (isDragging ? ' dragging' : '')}
		style={style}
		data-type={item.type}
		data-id={item.id}
		onClick={onClick}
		onDragOver={(e) => {
			if (!isDragging && item.type === 'folder') {
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
		{item.id + ": " + item.name}
	</div>);
};
export default FolderItem;
