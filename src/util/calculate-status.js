'use strict';
module.exports = function calculateStatus(counts) {
	if (!counts) {
		return 'skipped';
	}
	if (counts.error) {
		return 'error';
	} else if (counts.failure) {
		return 'failure';
	} else if (counts.success) {
		return 'success';
	}
	return 'skipped';
};

