import Actions from '../actions';

const _state = {
	default: {
		isDragging: false,
	},
};

const dragdrop = (state = _state, action) => {
	switch (action.type) {
		case Actions.DRAG_ENTER:
		
			break;
	}
	return state;
}
export default dragdrop;
