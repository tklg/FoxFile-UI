import React from 'react';
import FolderItem from './FolderItem';
import {connect} from 'react-redux';
import {List} from 'react-virtualized';
import Dimensions from '../classes/Dimensions';
import {scrollLeft, scrollTo} from '../actions/sidescroll';

const rowRenderer = ({key, index, isScrolling, isVisible, style, content, active}) => {
	return (
	<FolderItem key={key} style={style} item={content[index]} selected={active === content[index].index} />
	);
}

let Folder = ({id, name, position, files, activeIndex, onBackClick, onHeaderClick, isLeftmost}) => (
	<div 
		className={"folder" + (position === 'hidden-left' ? ' hidden' : '')} 
		data-id={id} 
		style={{width: Dimensions.barWidth, height: Dimensions.barHeight}}>
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
	</div>
);

const mapDispatchToProps = (dispatch, props) => {
	return {
		onBackClick(e) {
			e.stopPropagation();
			dispatch(scrollLeft());
		},
		onHeaderClick(e) {
			e.stopPropagation();
			dispatch(scrollTo(props.path));
		}
	}
};

Folder = connect(null, mapDispatchToProps)(Folder);

export default Folder;