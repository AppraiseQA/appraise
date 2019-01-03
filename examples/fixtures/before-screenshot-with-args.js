/* eslint-disable no-undef */
'use strict';
module.exports = function (params) {
	return {
		contentType: 'text/html',
		content: `
        <html>
        	<body>
        		<span id="content"></span>
        	</body>
        </html>`,
		beforeScreenshotArgs: [params.text],
		beforeScreenshot: (newText) => {
			console.log('I am in your browser', newText);
			window.document.getElementById('content').innerHTML = newText;
		}
	};
};
