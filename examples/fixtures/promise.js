'use strict';
const fs = require('fs'),
	path = require('path'),
	writeAsync = function (name, content) {
		return new Promise((resolve, reject) => {
			fs.writeFile(name, content, 'utf8', (err, result) => {
				if (err) {
					return reject(err);
				}
				resolve(result);
			});
		});
	};

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

	return writeAsync(cssFile, css)
		.then(() => writeAsync(htmlFile, html))
		.then(() => path.basename(htmlFile));
};
