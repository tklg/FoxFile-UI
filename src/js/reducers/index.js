import Actions from '../actions';

const without = (arr, x) => {
	for (const i in arr) {
		if (arr[i] == x) arr.splice(i, 1);
	}
	return [...arr];
}

const actionHandler = (state = {}, action) => {
	//console.log(action);
	const {type, id, files, elemType} = action;
	let distance,
		path;

	switch (type) {

// PRELOAD 	===============
		case Actions.LOAD_USER:
			let user = action.data;
			return {
				readyState: {
					...state.readyState,
					user: user ? 'done' : 'working',
				},
				user,
				path: user ? [user.uuid] : [],
			};
		case Actions.CHECK_KEY:
			return {
				baseKey: action.data,
			};
		case Actions.LOAD_TREE:
			let tree = action.data;
			return {
				readyState: {
					...state.readyState,
					files: tree ? 'done' : 'working'
				},
				tree,
			};
		case Actions.DECRYPT_TREE:
			let decryptedTree = action.data;
			return {
				readyState: {
					...state.readyState,
					decrypt: decryptedTree ? 'done' : 'working'
				},
				tree: decryptedTree,
			};
		case Actions.PRELOAD_DONE:
			return {
				
			};
		case Actions.SET_KEY:
			return {
				user: {
					...state.user,
					baseKey: action.data
				}
			};

// DRAGDROP ===============
		case Actions.DRAG_ENTER:
			if (state.dragging.id) return {};
			if (state.dragging.id === id && state.dragging.type === elemType) return {};
			return {
				dragging: {
					type: elemType,
					id
				},
			};
		case Actions.DRAG_LEAVE:
			if (!state.dragging.id) return {};
			return {
				dragging: {
					type: null,
					id: null,
				},
			};
		case Actions.DRAG_DROP:
			if (!state.dragging.id) return {};
			return {
				uploads: files,
				dragging: {
					type: null,
					id: null,
				},
			};

// SCROLLING ========================

		case Actions.SCROLL_LEFT:
			if (!state.path.length) return {};
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
				scrolling: {
					diff: 0,
				},
			}
		default: return {};
	}
}

export default actionHandler;