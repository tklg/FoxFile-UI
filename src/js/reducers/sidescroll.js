import {Actions} from '../actions/index.js';

const initialState = {
	folders: {},
	openedFolders: [],
	folderIndex: 0,
	modal: null,
	selected: [],
}

const sidescroll = (state = initialState, action) => {
	let distance, index;
	switch (action.type) {
		case Actions.SCROLL_LEFT:
			if (state.folderIndex === 0) return state;
			distance = action.distance || 1;
			return {
				...state,
				folderIndex: state.folderIndex - distance,
			}
		case Actions.SCROLL_RIGHT:
			distance = action.distance || 1;
			return {
				...state,
				folderIndex: state.folderIndex + distance,
			}
		case Actions.SCROLL_TO:
			index = action.index || 0;
			return {
				...state,
				folderIndex: index,
			}
		default:
			return state;
	}
}

export default sidescroll;