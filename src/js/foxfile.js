import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import {createStore, applyMiddleware} from 'redux';
import reducers from './reducers';
import FoxFileUI from './components/FoxFileUI.js';

let store = createStore(reducers, applyMiddleware(
	thunkMiddleware
));

ReactDOM.render(
	<Provider store={store}>
		<FoxFileUI />
	</Provider>,
	document.getElementById('root')
);
