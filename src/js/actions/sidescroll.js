export const sidescroll = {
	SCROLL_LEFT: 'scroll_left',
	SCROLL_TO: 'scroll_to',
	SCROLL_START: 'scroll_start',
	SCROLL_END: 'scroll_end',
};

const scrollStart = path => {
	return {
		type: sidescroll.SCROLL_START,
		path,
	}
}

const scrollEnd = path => {
	return {
		type: sidescroll.SCROLL_END,
		path,
	}
}

const scrollL = dist => {
	return {
		type: sidescroll.SCROLL_LEFT,
		dist,
	}
}

export const scrollLeft = distance => {
	return dispatch => {
		dispatch(scrollL(distance));
		dispatch(scrollEnd());
	}
}

/*export const scrollTo = path => {
	return {
		type: sidescroll.SCROLL_TO,
		path,
	}
}*/

function scrollDelay(n) {
	const ms = n || 500;
	return new Promise(r => {
		setTimeout(() => {
			r();
		}, ms);
	});
}

export const scrollTo = path => {
	return dispatch => {
		dispatch(scrollStart(path));
		scrollDelay()
		.then(() => {
			dispatch(scrollEnd(path));
		});
	}
}