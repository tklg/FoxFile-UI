import React from 'react';
import Header from '../containers/Header';
import Breadcrumbs from '../containers/Breadcrumbs';
import FileManager from '../containers/FileManager';

const FoxFileUI = () => (
	<div className="root flex-container fc-vertical">
		<Header />
		<Breadcrumbs />
		<FileManager />
	</div>
)

export default FoxFileUI;
