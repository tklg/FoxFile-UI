/*
TO USE: include reloadr.js and tell it what to check:

	Reloadr.go({
		client: [
			'/js/main.js',
			'/css/layout.css'
		],
		server: [
			'index.php'
		],
		path: '/reloadr.php',
		frequency: 2000
	});

	All keys are optional. If you don't give client or server, though, it won't do anything.

	Shortcut: Reloadr.watch([
		'/js/main.js',
		'/css/layout.css'
	]);
*/

var Reloadr = {
	options: {
		frequency: 2000,
		client: [],
		server: [],
		path: '/reloadr.php'
	},
	req: new XMLHttpRequest(),
	timeout: null,
	watch: function(options) { this.go.call(this, options); },
	go: function(options) {
		if ( options )

			// deal with array being passed
			if ( typeof options.length != 'undefined')
				this.options.client = options;

			// change any options given
			else for (x in options)
				this.options[x] = options[x];

		// set up new timeout
		clearTimeout(this.timeout);
		this.timeout = setTimeout(function() {
			Reloadr.poll.call(Reloadr);
		}, this.options.frequency);
	},
	ajax: function(url, callback) {
		this.req.open("GET", url, false);
		this.req.setRequestHeader('If-Modified-Since', window._Reloadr_LoadTime.toUTCString());
		this.req.send(null);
		if (this.req.status == 200)
			callback.call(
				Date.parse(
					this.req.getResponseHeader('Last-Modified')
				)
			);
	},
	poll: function(options) {
		var urls = this.options.client.slice();

		// build url for server-side files
		if ( this.options.server.length )
			urls.push(this.options.path +'?'+ this.options.server.join(','));

		var self = this;

		// check 'em
		for (i in urls) {
			(function (i) {
				self.ajax.call(self, urls[i], function () {
					if (this > Date.parse(window._Reloadr_LoadTime)) {
						if (urls[i].slice(-3) === 'css') {
							// handle linked css
							var links = document.getElementsByTagName('link');
							for (j = 0; j < links.length; j++) {
								var link = links[j];
								if (link.rel === 'stylesheet' && link.href.indexOf(urls[i]) > -1) {
									link.href = link.href.replace(/(.*)\.css(.*)/gi, '$1.css?' + (+new Date));
								}
							}

							// handle @imported css
							var styles = document.styleSheets;
							for (var j = 0; j < styles.length; j++) {
								var style = styles[j];
								var rules = style.cssRules || style.rules;
								if (rules) {
									for (var k = 0; k < rules.length; k++) {
										if (rules[k] instanceof CSSImportRule) {
											var rule_css = rules[k].cssText;
											if (rule_css.indexOf(urls[i]) > -1) {
												var new_rule_css = rule_css.replace(/@import(.*)\.css(.*)"\)/i, '@import$1.css?' + (+new Date) + '")');
												style.deleteRule(k);
												style.insertRule(new_rule_css, k);
											}
										}
									}
								}
							}

							window._Reloadr_LoadTime = new Date();
						}
						else {
							location.reload();
						}
					}
				});
			})(i);
		}

		this.go();
	},
	init: function(options) {
		window._Reloadr_LoadTime = new Date();
	}
};
Reloadr.init();