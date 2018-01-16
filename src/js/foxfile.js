import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import reducers from './reducers';
import FoxFileUI from './components/FoxFileUI.js';

let store = createStore(reducers, {});

ReactDOM.render(
	<Provider store={store}>
		<FoxFileUI />
	</Provider>,
	document.getElementById('root')
);
