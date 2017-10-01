/*global window, document */
'use strict';
window.addEventListener('load', () => {
	const setOpacity = function (element, opacity) {
			element.style.opacity = opacity;
		},
		getCssScale = function (inputScale) {
			if (inputScale < 0) {
				return -1 / inputScale;
			}
			if (inputScale > 0) {
				return inputScale;
			}
			return 1;
		},
		setScale = function (element, scale) {
			// -5 > 0.1
			// 5 > 10
			element.style.transform = 'scale(' + getCssScale(scale) + ')';
		},
		setupListeners = function (target, control) {
			for (const field of control.querySelectorAll('[data-overlay-role="visibility"]')) {
				field.addEventListener('change', () => target.classList.toggle('hidden'));
				if (!field.getAttribute('checked')) {
					target.classList.add('hidden');
				}
			}
			for (const field of control.querySelectorAll('[data-overlay-role="opacity"]')) {
				field.addEventListener('change', () => setOpacity(target, field.value));
				field.addEventListener('input', () => setOpacity(target, field.value));
				setOpacity(target, field.value);
			}
			for (const field of control.querySelectorAll('[data-overlay-role="scale"]')) {
				field.addEventListener('change', () => setScale(target, field.valueAsNumber));
				field.addEventListener('input', () => setScale(target, field.valueAsNumber));
				setScale(target, field.valueAsNumber);
			}
		};
	for (const control of document.querySelectorAll('[data-overlay-control]')) {
		const targetId = control.getAttribute('data-overlay-control'),
			target = document.getElementById(targetId);
		if (target) {
			setupListeners(target, control);
		}
	}
	for (const control of document.querySelectorAll('.draggable')) {
		control.addEventListener('dragstart', e => {
			control.setAttribute('drag-origin-x', e.clientX);
			control.setAttribute('drag-origin-y', e.clientY);
		});
		control.addEventListener('dragend', e => {
			const originX = parseInt(control.getAttribute('drag-origin-x')),
				originY = parseInt(control.getAttribute('drag-origin-y')),
				currentTop = parseInt(control.style.top) || 0,
				currentLeft = parseInt(control.style.left) || 0;
			control.style.left = ((currentLeft + e.clientX - originX) || 0) + 'px';
			control.style.top = ((currentTop + e.clientY - originY) || 0) + 'px';
		});
	}
});

