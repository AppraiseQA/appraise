/*global module */
'use strict';
const path = require('path');
module.exports = function stripExtension(filePath) {
	return path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
};

