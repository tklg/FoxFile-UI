import Actions from '../actions';

const _state = {
	dragging: {
		type: null,
		id: null,
	},
	uploads: [],
};

const without = (arr, x) => {
	for (const i in arr) {
		if (arr[i] == x) arr.splice(i, 1);
	}
	return [...arr];
}

const dragdrop = (state = _state, action) => {
	const {type, id, files, elemType} = action;
	switch (type) {
		case Actions.DRAG_ENTER:
			if (state.dragging.id) return state;
			if (state.dragging.id === id && state.dragging.type === elemType) return state;
			return {
				...state,
				dragging: {
					type: elemType,
					id
				},
			};
		case Actions.DRAG_LEAVE:
			if (!state.dragging.id) return state;
			return {
				...state,
				dragging: {
					type: null,
					id: null,
				},
			};
		case Actions.DRAG_DROP:
			if (!state.dragging.id) return state;
			return {
				...state,
				uploads: files,
				dragging: {
					type: null,
					id: null,
				},
			};
	}
	return state;
}
export default dragdrop;
