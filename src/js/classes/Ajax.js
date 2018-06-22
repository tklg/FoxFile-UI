let ajaxcfg = {};

export default class Ajax {
	static get(opts) {
		if (!opts) opts = {};
		opts.method = 'get';
		return Ajax.ajax(opts);
	}
	static post(opts) {
		if (!opts) opts = {};
		opts.method = 'post';
		return Ajax.ajax(opts);
	}
	static put(opts) {
		if (!opts) opts = {};
		opts.method = 'put';
		return Ajax.ajax(opts);
	}
	static patch(opts) {
		if (!opts) opts = {};
		opts.method = 'patch';
		return Ajax.ajax(opts);
	}
	static delete(opts) {
		if (!opts) opts = {};
		opts.method = 'delete';
		return Ajax.ajax(opts);
	}
	static head(opts) {
		if (!opts) opts = {};
		opts.method = 'head';
		return Ajax.ajax(opts);
	}
	static options(opts) {
		if (!opts) opts = {};
		opts.method = 'options';
		return Ajax.ajax(opts);
	}
	static ajax(opts) {
		if (!opts) throw 'Missing required options parameter.';
		if (opts.method) {
			if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(opts.method.toLowerCase())) throw 'opts.method must be one of: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.';
			opts.method = opts.method.toUpperCase();
		}

		var xhr = opts.xhr || new XMLHttpRequest();

		var fd = null;
		var qs = '';
		if (opts.data && opts.method.toLowerCase() != 'get') {
			fd = new FormData();
			for (let key in opts.data) fd.append(key, opts.data[key]);
		} else if (opts.data) {
			qs += '?';
			let params = [];
			for (let key in opts.data) {
				params.push([key, opts.data[key]].join('='));
			}
			qs += params.join('&');
		}

		xhr.onload = () => {
			if (xhr.status !== 200) return xhr.onerror();
			var data = xhr.response;
			if (opts.success) opts.success(data, xhr);
		}
		xhr.onerror = () => {
			var data = xhr.response;

			// method not allowed
			if (xhr.status === 405) {
				if (opts.error) opts.error(data, xhr);
				return;
			}

			try {
				// if the access token is invalid, try to use the refresh token
				var json = JSON.parse(data);
				if (json.error === 'access_denied' && json.hint.includes('token') && json.hint.includes('invalid') && ajaxcfg.refresh_token) {
					Ajax.refresh(opts);
					return;
				} else if (json.error === 'access_denied' && json.hint.includes('token') && json.hint.includes('revoked')) {
					if (ajaxcfg.revoked) ajaxcfg.revoked(data, xhr);
					return;
				}
				if (opts.error) opts.error(data, xhr);
			} catch (e) {
				opts.error(data, xhr);
			}
		}
		xhr.open(opts.method || 'GET', opts.url + qs || location.href);

		if (opts.headers) {
			for (let key in opts.headers) xhr.setRequestHeader(key, opts.headers[key]);
		}
		if (ajaxcfg.access_token && !(opts.headers || {}).Authorization) xhr.setRequestHeader('Authorization', 'Bearer ' + ajaxcfg.access_token);

		xhr.send(fd);
	}
	static refresh(opts) {
		//console.log("trying refresh token");
		var xhr = new XMLHttpRequest();

		var fd = new FormData();
		const OAUTH_TOKEN_REQUEST = {
			grant_type: 'refresh_token',
			refresh_token: ajaxcfg.refresh_token,
			client_id: 'foxfile',
			client_secret: 1,
		};
		for (var key in OAUTH_TOKEN_REQUEST) {
			fd.append(key, OAUTH_TOKEN_REQUEST[key]);
		}		
		// try original request
		xhr.onload = () => {
			if (xhr.status !== 200) return xhr.onerror();
			if (ajaxcfg.refresh) ajaxcfg.refresh(xhr.response);
			var json = JSON.parse(xhr.response);
			ajaxcfg.access_token = json.access_token;
			ajaxcfg.refresh_token = json.refresh_token;
			Ajax.ajax(opts);
		}
		// if this fails, dont try again
		xhr.onerror = () => {
			var data = xhr.response;
			if (opts.error) opts.error(data, xhr);
		}
		xhr.open('POST', ajaxcfg.refresh_url);

		xhr.send(fd);
	}
	static setTokenData(tokens) {
		if (!tokens) throw "Missing tokens.";
		if (!tokens.access_token && !tokens.refresh_token && !tokens.refresh_url) throw "Missing at least one of: access_token, refresh_token, refresh_url.";
		if (tokens.access_token) ajaxcfg.access_token = tokens.access_token;
		if (tokens.refresh_token) ajaxcfg.refresh_token = tokens.refresh_token;
		if (tokens.refresh_url) ajaxcfg.refresh_url = tokens.refresh_url;
		return true;
	}
	static onRefresh(func) {
		ajaxcfg.refresh = func;
	}
	static onRefreshFail(func) {
		ajaxcfg.refreshfail = func;
	}
	static onRevoked(func) {
		ajaxcfg.revoked = func;
	}
}