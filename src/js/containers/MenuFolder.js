import React from 'react';
import {connect} from 'react-redux';

let MenuFolder = ({user, location}) => (
	<div className="folder-menu">
		<header>
			<span className="user-name">name</span>
			<span className="user-email">email</span>
		</header>
		<ul>
			<li className="selected">Files</li>
			<li>Trash</li>
		</ul>
	</div>
)

MenuFolder = connect()(MenuFolder);

export default MenuFolder;