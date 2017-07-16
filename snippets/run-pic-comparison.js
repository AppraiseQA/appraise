/*global require */
'use strict';
const cp = require('./png-diff'),
	path = require('path');

console.log('comparing same image');

cp(path.join(__dirname, '..', 'examples/images/blueline.png'), path.join(__dirname, '..', 'examples/images/blueline.png'))
.then(console.log, console.error)
.then(() => console.log('comparing different dim images'))
.then(() => cp(path.join(__dirname, '..', 'examples/images/blueline.png'), path.join(__dirname, '..', 'kano-7-1.png')))
.then(console.log, console.error)
.then(() => console.log('comparing rotated image'))
.then(() => cp(path.join(__dirname, '..', 'examples/images/blueline.png'), path.join(__dirname, '..', 'examples/images/blueline-rotated.png')))
.then(console.log, console.error);
