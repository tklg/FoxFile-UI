import React from 'react';
import {connect} from 'react-redux';

let MenuFolder = ({user, location, position, style}) => (
	<div className={"folder-menu" + (position === 'hidden-left' ? ' hidden' : '')} style={style}>
		<header>
			<span className="user-name">{'name (' + position + ')'}</span>
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