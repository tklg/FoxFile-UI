import React from 'react';
import Ajax from '../classes/Ajax.js';
import Tree from '../classes/Tree';
import Crypto from '../classes/Crypto';
import {loadUser, loadTree, decryptTree, preloadDone} from '../actions/preload.js';

const stepDetails = {
	user: 'Fetching user info',
	files: 'Downloading file tree',
	decrypt: 'Decrypting file data',
};

class Preloader extends React.Component {
	constructor() {
		super();
		this.load = this.load.bind(this);
		this.handleKeyCheck = this.handleKeyCheck.bind(this);
		this.state = {
			step: 0,
			error: null,
			data: null,
			user: {},
			password: '',
			hasKey: false,
			needsKey: false,
			keyWorking: false,
			keyError: '',
		};
	}
	load() {
		const urlBase = '/foxfile/src/public/api';

		const dispatch = this.props.dispatch;
		const _this = this;
		switch (this.state.step) {
			case 0:
				//console.log('user');
				dispatch(loadUser());
				Ajax.get({
					url: `${urlBase}/user`,
					success(data) {
						const user = JSON.parse(data);
						dispatch(loadUser(user || 'done'));
						_this.setState({
							step: 1,
							user,
						}, () => {
							_this.load();
						});
					},
					error(err) {
						_this.setState({
							error: err,
						});
					}
				});
				break;
			case 1:
				// dispatch(checkKey());
				_this.handleKeyCheck();
				break;
			case 2:
				//console.log('files');
				dispatch(loadTree());
				Ajax.get({
					url: `${urlBase}/files`,
					success(data) {
						try {data = JSON.parse(data);} catch (e) {console.warn(e)}
						dispatch(loadTree(data || 'done'));
						_this.setState({
							step: 3,
							data: data,
						}, () => {
							_this.load();
						});
					},
					error(err) {
						_this.setState({
							error: err,
						});
					}
				});
				break;
			case 3:
				//console.log('decrypt');
				dispatch(decryptTree());
				// build tree from list of folders and files
				const tree = new Tree(_this.props.user.uuid);
				tree.import(_this.state.data);
				// decrypt file and folder names
				tree.map(async (node) => {
					if (node.encrypted) {
						const data = {
							fileName: node.name,
							file: null,
							fileKey: node.key,
						};
						const res = await Crypto.decrypt(data, null);
						if (res.fileName) node.name = res.fileName;
						else node.file = res.file;
						node.encrypted = false;
						return node;
					} else {
						return node;
					}
				});
				console.log(tree.root);
				setTimeout(() => {
					dispatch(decryptTree(tree));
					_this.setState({
						step: 4,
					}, () => {
						_this.load();
					});
				}, 400) ;
				break;
			case 4:
				//console.log('preloaddone');
				dispatch(preloadDone());
				setTimeout(() => {
					_this.setState({
						step: 4,
					});
				}, 300);
				break;
		}
	}
	async handleKeyCheck() {
		let basekey = localStorage.getItem('foxfile_key');
		// key does not exist, let user enter it
		if (this.state.user.haskey == 0) {
			this.setState({
				hasKey: false,
				needsKey: true,
			});
			return;
		}
		// user has key but needs to enter it
		if (!basekey && this.state.user.haskey == 1) {
			this.setState({
				hasKey: true,
				needsKey: true,
			});
			return;
		}
		// validate key by hashing and comparing to server copy

		this.setState({
			hasKey: true,
			needsKey: false,
			keyWorking: false,
			step: 2,
		}, () => {
			this.load();
		})

	}
	componentDidMount() {
		if (!this.state.step) this.load();
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
		const steps = this.getSteps(this.props.readyState);
		return (
			<div className={"preloader flex-container fc-center" + (this.state.step === 4 ? ' done' : '')}>
				<form className={'keybox' + (this.state.needsKey ? ' active' : '') + (this.state.keyWorking ? ' working' : '')}>
					<label>{this.state.hasKey ? 'Enter your master key' : 'Set a master encryption key'}</label>
					<div className="input-container">
						<input type="password" name="password"></input>
						<button className="btn">{this.state.hasKey ? 'Unlock' : 'Set'}</button>
					</div>
					<span className="error">{this.state.keyError}</span>
				</form>
				<ul className="steps">
					{steps}
				</ul>
			</div>
		);
	}
}

export default Preloader;