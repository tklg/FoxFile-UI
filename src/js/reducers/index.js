import {combineReducers} from 'redux';
import sidescroll from './sidescroll';
import dragdrop from './dragdrop';
import filetree from './filetree';

const app = combineReducers({
	sidescroll: sidescroll,
	//dragdrop: dragdrop,
	filetree: filetree,
});

export default app;