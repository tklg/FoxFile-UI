import React from 'react';

function Preloader({readyState, dispatch}) {
	return (
		<div className="preloader flex-container fc-center">
			<ul className="steps">
				<li className="done">
					<svg className="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle className="circle" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle></svg>
					<span>Checking access token</span>
				</li>
				<li className="running">
					<svg className="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle className="circle" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle></svg>
					<span>Downloading file tree</span>
				</li>
				<li className="waiting">
					<svg className="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle className="circle" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle></svg>
					<span>Decrypting file data</span>
				</li>
			</ul>
		</div>
	);
}

export default Preloader;