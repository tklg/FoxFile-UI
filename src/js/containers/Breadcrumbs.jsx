import {TestFolders} from '../lib/TestData';
import {scrollTo} from '../actions/sidescroll';
import React from 'react';

const defaultFolders = TestFolders;

const getBreadcrumb = ({file, onClick}) => (
	<div
		key={file.id} 
		data-id={file.id} 
		className="breadcrumb"
		onClick={() => onClick(file)}>{file.name}</div>
);

class Breadcrumbs extends React.Component {
	constructor() {
		super();
		this.onClick = this.onClick.bind(this);
	}
	onClick(item) {
		this.props.dispatch(scrollTo(item.path));
	}
	render() {
		return (
		<nav className="breadcrumbs">
			{this.props.files.map(file => getBreadcrumb({file, onClick: this.onClick}))}
		</nav>
		)
	}
}

export default Breadcrumbs;