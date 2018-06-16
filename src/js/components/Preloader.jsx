import React from 'react';

const stepDetails = {
	user: 'Fetching user info',
	files: 'Downloading file tree',
	decrypt: 'Decrypting file data',
};

class Preloader extends React.Component {
	constructor() {
		super();

	}
	startLoad() {
		
	}
	getSteps(state) {
		let steps = [];
		for (const i in state) {
			steps.push(
				<li key={i} className={state[i]}>
					<div className="spinner">
					    <svg className="circular" viewBox="25 25 50 50">
					    	<circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
					    </svg>
					</div>
						<span>{stepDetails[i]}</span>
				</li>);
		}
		return steps;
	}
	render() {
		let state = this.props.readyState;

		let started = false;
		for (const i in state) {
			if (state[i] !== 'waiting') started = true;
		}
		if (!started) this.startLoad();

		const steps = this.getSteps(state);
		return (
			<div className="preloader flex-container fc-center">
				<ul className="steps">
					{steps}
					{/*<li className="done">
						<div className="spinner">
						    <svg className="circular" viewBox="25 25 50 50">
						    	<circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
						    </svg>
						</div>
	  					<span>Fetching user info</span>
					</li>
					<li className="running">
						<div className="spinner">
						    <svg className="circular" viewBox="25 25 50 50">
						    	<circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
						    </svg>
						</div>
						<span>Downloading file tree</span>
					</li>
					<li className="waiting">
						<div className="spinner">
						    <svg className="circular" viewBox="25 25 50 50">
						    	<circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
						    </svg>
						</div>
						<span>Decrypting file data</span>
					</li>*/}
				</ul>
			</div>
		);
	}
}

export default Preloader;