import React from 'react';
import Header from '../components/Header';
import Breadcrumbs from './Breadcrumbs';
import FileManager from './FileManager';
import Preloader from './Preloader';
import {TestData, createFolderChain, findFile} from '../lib/TestData';
import reducer from '../reducers'

const defaultPassword = 'foxfoxfox';

class FoxFileUI extends React.Component {
	constructor() {
		super();
		this.state = reducer({
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
			<Preloader />
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
		</div>);
	}
}

export default FoxFileUI;
