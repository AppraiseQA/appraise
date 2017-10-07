'use strict';
const fs = require('fs'),
	path = require('path');
module.exports = function (params, context) {
	const css = `
			#header {
				font: italic 200% Helvetica;
				white-space: nowrap;
				color: blue;
				overflow: visible;
			}
		`,
		html = `
			<html>
				<head>
					<link rel="stylesheet" href="style.css" />
				</head>
				<body>
					<div id="header">${params.name}</div>
				</body>
			</html>
		`,
		cssFile = path.join(context.outputDir, 'style.css'),
		htmlFile = path.join(context.outputDir, 'result.html');

	fs.writeFileSync(cssFile, css, 'utf8');
	fs.writeFileSync(htmlFile, html, 'utf8');
	return path.basename(htmlFile);
};
