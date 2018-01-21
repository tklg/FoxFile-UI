import Actions from '../actions';

const openedFolders = [];

const sidescroll = (state = openedFolders, action) => {
	let distance;
	switch (action.type) {
		case Actions.SCROLL_LEFT:
			if (!state.length) return state;
			return state.slice(0, state.length -1);
		case Actions.SCROLL_TO:
			let path = action.path;
			return path;
		default:
			return state;
	}
}

export default sidescroll;