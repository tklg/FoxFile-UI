// a class to try things out
// moment would of course be better

export default class DateFormat {
	static format(date, fmt, is24hour) {
		let format = "MM d, yy at h:m:s a";
		if (fmt) {
			format = fmt;
		}
		return new _DateFormat(date, format, is24hour || false).format();
	}
};

let SHORT_DATES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let LONG_DATES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class _DateFormat {
	constructor(date, fmt, is24hour) {
		if (!this.isValidFormat(fmt)) throw `Invalid format string: ${fmt}`;
		if (date instanceof Date) date = date.toJSON().replace(/^(.*)T(.*)\.\d{3}Z$/, '$1 $2');
		let reg = /^(\d{4})[- ](\d{2})[- ](\d{2}) (\d{2})[: ](\d{2})(?:[: ](\d{2}))?$/;
		if (!reg.test(date)) throw `Invalid date: ${date}`;
		let parts = date.match(reg);
		let data = {
			year: parts[1],
			month: parts[2],
			day: parts[3],
			hour: parts[4],
			minute: parts[5],
			second: parts[6] || null,
			ampm: '',
		}
		data.ampm = data.hour > 12 || (data.hour == 12 && data.minute > 0) ? 'pm' : 'am';
		if (!is24hour) {
			data.hour = data.hour > 12 ? data.hour - 12 : data.hour;
		}
		this.data = data;
		this.str = fmt;
	}
	isValidFormat(fmt) {
		return fmt.split(' ').reduce((a, x) => {
			return a || /(?:d|j|M{1,2}|y{1,2}|h|m|s|[aA])/.test(x);
		}, false);
	}
	format() {
		let data = this.data;
		for (let what in data) {
			switch (what) {
				case 'year':
					this.replace('yy', data[what]);
					this.replace('y', data[what].substr(2));
					break;
				case 'month':
					let val = +data[what];
					this.replace('j', val);
					this.replace('MM', LONG_DATES[val]);
					this.replace('M', SHORT_DATES[val]);
					break;
				case 'day':
					this.replace('d', data[what]);
					break;
				case 'hour':
					this.replace('h', data[what]);
					break;
				case 'minute':
					this.replace('m', data[what]);
					break;
				case 'second':
					this.replace('s', data[what]);
					break;
				case 'ampm':
					this.replace('a', data[what]);
					this.replace('A', data[what].toUpperCase());
					break;
			}
		}
		return this.str;
	}
	// use a tokenizer instead of this thing
	replace(find, repl) {
		let reg = new RegExp('(.*\\W|^)' + find + '(\\W.*|$)', 'g');
		this.str = this.str.replace(reg, `$1${repl}$2`);
	}
}