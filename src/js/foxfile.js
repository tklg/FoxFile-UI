import React from 'react';
import ReactDOM from 'react-dom';
import FoxFileUI from './containers/FoxFileUI.js';

ReactDOM.render(
	<FoxFileUI />,
	document.getElementById('root')
);

// http://localhost/auth3/src/public/authorize?response_type=code&client_id=foxfile&redirect_uri=localhost/foxfile/src/public/auth_redirect&scope=user.all&state=1
