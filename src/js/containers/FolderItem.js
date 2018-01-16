import React from 'react';
import {connect} from 'react-redux';

let FolderItem = ({item, style, selected}) => (
	<div 
		className={"file" + (selected ? ' selected' : '')}
		style={style}
		data-type={item.type}
		data-id={item.index}>
		{item.index + ": " + item.name}
	</div>
)

FolderItem = connect()(FolderItem);

export default FolderItem;