import React from 'react';
import FolderItem from './FolderItem';
import {connect} from 'react-redux';
import {List} from 'react-virtualized';

const rowRenderer = ({key, index, isScrolling, isVisible, style, content, active}) => {
	return (
	<FolderItem key={key} style={style} item={content[index]} selected={active === content[index].index} />
	);
}

let Folder = ({id, name, files, activeIndex}) => (
	<div className="folder" data-id={id}>
		<header className="flex-container fc-horizontal">
			<button className={"leftmost"}>‹</button>
			<h1 className="flex">{id + ": " + name}</h1>
			<div className="bottom-border"><div className="indeterminate"></div></div>
		</header>
		<List 
			className="scroller"
			width={300}
			height={400}
			rowCount={files.length}
			rowHeight={40}
			rowRenderer={(args) => rowRenderer({...args, content: files, active: activeIndex})}
		/>
	</div>
);

Folder = connect()(Folder);

export default Folder;