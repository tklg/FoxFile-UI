import React from 'react';

class MenuFolder extends React.Component {
	constructor() {
		super();

		this.getListElements = this.getListElements.bind(this);
	}
	getListElements() {
		return this.props.elems.map((el, i) => {
			return <li key={i} className={this.props.active === i ? 'selected' : ''} onClick={el.onClick}>{el.name}</li>;
		});
	}
	render() {
		const {user, location, position, style} = this.props;
		return (
			<div className={"folder-menu"} style={style}>
				<header>
					<span className="user-name">{'name (' + position + ')'}</span>
					<span className="user-email">email</span>
				</header>
				<ul>
					{
						this.getListElements()
					}
				</ul>
			</div>
		);
	}
}

export default MenuFolder;