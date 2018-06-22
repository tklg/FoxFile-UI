import React from 'react';
import Header from '../components/Header.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';
import FileManager from './FileManager.jsx';
import Preloader from '../components/Preloader.jsx';
import {TestData, createFolderChain, findFile} from '../lib/TestData';
import reducer from '../reducers'
import Ajax from '../classes/Ajax.js'

Ajax.setTokenData({
	...JSON.parse(localStorage.getItem('foxfile_token')),
	refresh_url: 'http://localhost/foxfile/src/public/api/token'
});

const defaultPassword = 'foxfoxfox';

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
			folders: TestData,
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
		const openFolders = createFolderChain(this.state.folders, this.state.path);
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
				readyState={this.state.readyState} />
		</div>);
	}
}

export default FoxFileUI;
