export const sidescroll = {
	SCROLL_LEFT: 'scroll_left',
	SCROLL_RIGHT: 'scroll_right',
};

export const scrollLeft = distance => {
	return {
		type: Actions.SCROLL_LEFT,
		distance,
	}
}

export const scrollRight = distance => {
	return {
		type: Actions.SCROLL_RIGHT,
		distance,
	}
}

export const scrollTo = index => {
	return {
		type: Actions.SCROLL_TO,
		index,
	}
}