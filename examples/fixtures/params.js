'use strict';
module.exports = function (params, execContext) {
	const color = execContext.params.color;
	return {
		contentType: 'text/html',
		content: `
		<html>
			<head>
				<style>
					#header {
						font: italic 200% Helvetica;
						color: ${color};
						white-space: nowrap;
						overflow: visible;
					}
				</style>
			</head>
			<body>
				<div id="header">${params.text}</div>
			</body>
		</html>`
	};
};
