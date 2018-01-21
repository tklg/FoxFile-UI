import React from 'react';
import {connect} from 'react-redux';
import {scrollTo} from '../actions/sidescroll';

let FolderItem = ({item, style, selected, onClick}) => (
	<div 
		className={"file" + (selected ? ' selected' : '')}
		style={style}
		data-type={item.type}
		data-id={item.index}
		onClick={onClick}>
		{item.index + ": " + item.name}
	</div>
)

const mapDispatchToProps = (dispatch, props) => {
	return {
		onClick() {
			dispatch(scrollTo(props.item.path));
		},
	}
}

FolderItem = connect(null, mapDispatchToProps)(FolderItem);

export default FolderItem;