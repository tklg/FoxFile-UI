import React from 'react';

const getBreadcrumb = file => (
	<div key={file.index} data-id={file.index} className="breadcrumb">{file.name}</div>
);

const Breadcrumbs = ({files}) => (
	<nav className="breadcrumbs">
		{files.map(file => getBreadcrumb(file))}
	</nav>
);

export default Breadcrumbs;