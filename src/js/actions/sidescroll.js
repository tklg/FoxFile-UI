import Actions from './';

export const sidescroll = {
	SCROLL_LEFT: 'scroll_left',
	SCROLL_TO: 'scroll_to',
};

export const scrollLeft = distance => {
	return {
		type: sidescroll.SCROLL_LEFT,
		distance,
	}
}

export const scrollTo = path => {
	return {
		type: sidescroll.SCROLL_TO,
		path,
	}
}