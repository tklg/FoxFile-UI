import React from 'react';
import Header from '../components/Header.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';
import FileManager from './FileManager.jsx';
import Preloader from '../components/Preloader.jsx';
// import {TestData, createFolderChain, findFile} from '../lib/TestData';
import reducer from '../reducers'
import Ajax from '../classes/Ajax.js'

Ajax.setTokenData({
	...JSON.parse(localStorage.getItem('foxfile_token')),
	refresh_url: 'http://localhost/foxfile/src/public/api/token'
});
Ajax.onRefresh(function(data) {
	localStorage.setItem('foxfile_token', JSON.stringify({
		...JSON.parse(localStorage.getItem('foxfile_token')),
		...JSON.parse(data),
	}));
});

function createFolderChain(tree, path) {
	const opened = [];
	let current = tree;
	for (const uuid of path) {
		current = current.find(node => node.uuid === uuid);
		opened.push(current);
	}
	return opened;
}

class FoxFileUI extends React.Component {
	constructor() {
		super();
		this.state = reducer({
			readyState: {
				user: 'waiting', // log in
				files: 'waiting', // download file list
				decrypt: 'waiting', // waiting, working, done
			},
			user: {},
			path: [],
			// folders: TestData,
			tree: null,
			scrolling: {
				diff: 0,
			},
			dragging: {
				id: null,
				type: null
			},
			activePanel: 0, // 0, 1, 2, etc (0 is files)
		}, {});

		this.dispatch = this.dispatch.bind(this);
	}
	dispatch(action) {
		if (!action) throw new Error('missing action');
		if (action instanceof Function) {
			action(this.dispatch);
		} else {
			this.setState(prevState => reducer(prevState, action));
		}
	}
	render() {
		let openFolders = [];
		if (this.state.readyState.decrypt === 'done') openFolders = createFolderChain(this.state.tree, this.state.path);
		// console.log(openFolders)
		return (<div className="root flex-container fc-vertical">
			<Header />
			<Breadcrumbs 
				dispatch={this.dispatch}
				files={openFolders} />
			<FileManager
				active={this.state.activePanel}
				dispatch={this.dispatch}
				folders={openFolders}
				scrolling={this.state.scrolling}
				dragging={this.state.dragging} />
			<Preloader 
				dispatch={this.dispatch}
				readyState={this.state.readyState}
				user={this.state.user} />
		</div>);
	}
}

export default FoxFileUI;
