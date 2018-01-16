import React from 'react';
import {connect} from 'react-redux';

let FilePreview = ({id, name, files}) => (
	<div className="folder" data-id={id}>
		<header className="flex-container fc-horizontal">
			<button className={"leftmost"}>‹</button>
			<h1 className="flex">{id + ": " + name}</h1>
			<div className="bottom-border"><div className="indeterminate"></div></div>
		</header>
		
	</div>
);

FilePreview = connect()(FilePreview);

export default FilePreview;