import React from 'react';
import Ajax from '../classes/Ajax.js';
import Tree from '../classes/Tree';
import Crypto from '../classes/Crypto';
import Util from '../classes/Util';
import {loadUser, loadTree, decryptTree, preloadDone} from '../actions/preload.js';

const stepDetails = {
	user: 'Fetching user info',
	files: 'Downloading file tree',
	decrypt: 'Decrypting file data',
};
const urlBase = '/foxfile/src/public/api';
const HMAC_TEST_STRING = 'foxfile';

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
		this.onPasswordChange = this.onPasswordChange.bind(this);
		this.setMasterKey = this.setMasterKey.bind(this);
	}
	load() {

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
						try {err = JSON.parse(err)} catch (e) {}
						if (err.error && err.error === 'access_denied' && err.hint && err.hint.includes('header')) {
							document.location.href += 'login'
						}
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
		if (!this.state.user.signed || !this.state.user.signed.length) {
			this.setState({
				hasKey: false,
				needsKey: true,
			});
			return;
		}
		// user has key but needs to enter it
		if (!basekey && this.state.user.signed && this.state.user.signed.length) {
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
			error: null
		}, () => {
			this.load();
		})

	}
	componentDidMount() {
		if (!this.state.step) this.load();
  	}
  	onPasswordChange(e) {
  		this.setState({
  			password: e.target.value
  		})
  	}
  	async setMasterKey(e) {
  		e.preventDefault();
  		this.setState({
  			error: ' '
  		})
  		const _this = this;
  		const passwordBuffer = await crypto.subtle.digest('SHA-512', new TextEncoder('utf-8').encode(this.state.password));
  		const password = Util.ab2hex(passwordBuffer);
  		const signed = await Crypto.sign(HMAC_TEST_STRING, password);
  		const res = await Crypto.verify(signed, HMAC_TEST_STRING, password);
	  	if (!res) {
	  		this.setState({
	  			error: 'Test verification failed'
	  		})
	  		return;
	  	}

  		if (!this.state.hasKey) {
	  		Ajax.post({
	  			url: `${urlBase}/user/key`,
	  			data: {
	  				signed: signed
	  			},
	  			success(data) {
	  				localStorage.setItem('foxfile_key', password)
			  		_this.setState({
			  			needsKey: false,
			  			hasKey: true,
			  			step: 2,
			  			error: null
			  		}, () => {
			  			_this.load();
			  		});
	  			},
	  			error(err) {
	  				_this.setState({
	  					error: err
	  				})
	  			}
	  		});
	  	} else {

	  		const res = await Crypto.verify(this.props.user.signed, HMAC_TEST_STRING, password);

	  		if (!res) {
	  			this.setState({
	  				error: 'Incorrect password'
	  			})
	  			return;
	  		}
  		
	  		localStorage.setItem('foxfile_key', password)
	  		this.setState({
	  			needsKey: false,
	  			hasKey: true,
	  			error: null,
	  			step: 2,
	  		}, () => {
	  			_this.load();
	  		});
	  	}
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
				<form
				 	className={'keybox' + (this.state.needsKey ? ' active' : '') + (this.state.keyWorking ? ' working' : '')}
				 	onSubmit={this.setMasterKey}>
					<label><h1>{this.state.hasKey ? 'Enter your master key' : 'Set a master encryption key'}</h1></label>
					<p>It is important that you do not forget this key. Without it, you will not be able to recover your files.</p>
					{this.state.error && <span className="error">{this.state.error}</span>}
					<div className="input-container">
						<input type="password" name="password" required value={this.state.password} onChange={this.onPasswordChange}></input>
						<span className="input-placeholder">Master key</span>
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