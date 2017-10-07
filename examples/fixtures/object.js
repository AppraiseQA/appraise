'use strict';
module.exports = function (params) {
	return {
		contentType: 'text/html',
		content: `
		<html>
			<head>
				<style>
					#header {
						font: italic 200% Helvetica;
						color: blue;
						white-space: nowrap;
						overflow: visible;
					}
				</style>
			</head>
			<body>
				<div id="header">${params.name}</div>
			</body>
		</html>`
	};
};
