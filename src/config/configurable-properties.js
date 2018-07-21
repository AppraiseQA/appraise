// this is a list of properties that can be set and overridden from the command line, to the page header, to the example header
'use strict';
module.exports = [
	{
		argument: 'tolerance',
		optional: true,
		description: 'Tolerance for comparing individual pixels, number between 1 and 10. Larger value makes comparisons means more forgiving. Default is exact match.',
		example: '5'
	},
	{
		argument: 'allowed-difference',
		optional: true,
		description: 'Number of pixels allowed to be different until comparisons fail',
		example: '30'
	},
	{
		argument: 'initial-width',
		optional: true,
		description: 'Initial window width in pixels for web pages before screenshots. This can be used to force responsive sites to render in different widths.',
		default: '10',
		example: '1024'
	},
	{
		argument: 'initial-height',
		optional: true,
		description: 'Initial window height in pixels for web pages before screenshots. This can be used to force responsive sites to render in different heights.',
		default: '10',
		example: '768'
	},
	{
		argument: 'clip-x',
		optional: true,
		description: 'Initial X offset, in pixels, for taking screenshots, if you do not want to clip the whole page.',
		default: 'start from the left edge of the page',
		example: '200'
	},
	{
		argument: 'clip-y',
		optional: true,
		description: 'Initial Y offset, in pixels, for taking screenshots, if you do not want to clip the whole page.',
		default: 'start from the top of the page',
		example: '200'
	},
	{
		argument: 'clip-width',
		optional: true,
		description: 'The width of a clip, in pixels, for taking screenshots, if you do not want to clip the whole page.',
		default: 'full width of the rendered page',
		example: '200'
	},
	{
		argument: 'clip-height',
		optional: true,
		default: 'full height of the rendered page',
		description: 'Initial Y offset, in pixels, for taking screenshots, if you do not want to clip the whole page.',
		example: '200'
	},
	{
		argument: 'fixture',
		optional: true,
		description: 'The name of the node module for executing tests.'
	},
	{
		argument: 'fixture-engine',
		optional: true,
		description: 'The name of the engine for loading fixtures',
		default: 'node'
	},
	{
		argument: 'css',
		optional: true,
		description: 'path to an additional CSS file to load into pages, relative to the examples directory',
		default: 'not set'
	}
];
