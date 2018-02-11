import {combineReducers} from 'redux';
import sidescroll from './sidescroll';

const app = combineReducers({
	sidescroll: sidescroll,
});

export default app;