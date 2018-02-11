import Actions from '../actions';

const _state = {
	path: ['a'],
	scrolling: false,
};

const sidescroll = (state = _state, action) => {
	let distance,
		path;
	switch (action.type) {
		case Actions.SCROLL_LEFT:
			if (!state.path.length) return state;
			return {
				path: state.path.slice(0, state.path.length -1),
				scrolling: {
					direction: 'remove',
					diff: -1,
					folders: [state.path[state.path.length - 1]],
				},
			};
		case Actions.SCROLL_TO:
			path = action.path;
			return {
				path,
				scrolling: true,
			}
		case Actions.SCROLL_START:
			path = action.path;
			//console.log(path);
			//console.log(state.path);
			let dir;
			let diff = path.length - state.path.length;
			let folderDiff;
			if (diff > 0) {
				folderDiff = path.slice(path.length - diff, path.length);
			} else if (diff < 0) {
				folderDiff = state.path.slice(state.path.length - -diff, state.path.length);
			}
			//console.log(folderDiff);
			if (diff !== 0) {
				dir = {
					direction: diff > 0 ? 'add' : 'remove',
					diff,
					folders: folderDiff,
				};
			} else {
				dir = {diff: 0};
			}
			//console.log(path);
			return {
				path,
				scrolling: dir,
			};
		case Actions.SCROLL_END:
			//console.log(state.path);
			return {
				...state,
				scrolling: {
					diff: 0,
				},
			}
		default:
			return state;
	}
}

export default sidescroll;