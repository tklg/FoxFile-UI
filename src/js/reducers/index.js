import {combineReducers} from 'redux';
import sidescroll from './sidescroll';

const app = combineReducers({
	filePath: sidescroll,
});

export default app;