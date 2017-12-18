'use strict';
const fs = require('fs'),
	promisify = function (target, methodName) {
		return function () {
			const originalArgs = Array.prototype.slice.call(arguments);
			return new Promise((resolve, reject) => {
				const cb = function (err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				};
				originalArgs.push(cb);
				target[methodName].apply(target, originalArgs);
			});
		};
	},
	result = {};

['writeFile', 'appendFile', 'readFile', 'mkdir', 'stat', 'access'].forEach(method => result[method + 'Async'] = promisify(fs, method));

module.exports = result;
