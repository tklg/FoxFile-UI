import React from 'react';

const getBreadcrumb = file => (
	<div key={file.id} data-id={file.id} className="breadcrumb">{file.name}</div>
);

const Breadcrumbs = ({files}) => (
	<nav className="breadcrumbs">
		{files.map(file => getBreadcrumb(file))}
	</nav>
);

export default Breadcrumbs;