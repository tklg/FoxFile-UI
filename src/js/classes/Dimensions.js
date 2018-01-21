const minBarWidth = 320;

class Dimensions {
	static get windowWidth() {
		return window.innerWidth;
	}
	static get windowHeight() {
		return window.innerHeight;
	}
	static get maxNumBars() {
		if (Dimensions.windowWidth < 700) return 1;
		else if (Dimensions.windowWidth < 850) return 2; // thin second bar
		else return Math.round(Dimensions.windowWidth / minBarWidth) - 1; // last bar is always double width
	}
	static get barWidth() {
		return Math.floor(Dimensions.uBarWidth);
	}
	static get uBarWidth() {
		if (Dimensions.windowWidth < 850) return Dimensions.windowWidth / Dimensions.maxNumBars;
		else return Dimensions.windowWidth / (Dimensions.maxNumBars + 1);
	}
	static get barHeight() {
		return Dimensions.windowHeight - 50 - 30;
	}
}
export default Dimensions;
