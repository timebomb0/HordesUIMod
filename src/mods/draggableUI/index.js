import * as helpers from './helpers';
import { getState, saveState } from '../../utils/state';

// Drag all windows by their header
function draggableUIWindows() {
	Array.from(document.querySelectorAll('.window:not(.js-can-move)')).forEach($window => {
		$window.classList.add('js-can-move');
		helpers.dragElement($window, $window.querySelector('.titleframe'));
	});
}

// Save dragged UI windows position to state
function saveDraggedUIWindows() {
	const state = getState();

	Array.from(document.querySelectorAll('.window:not(.js-window-is-saving)')).forEach($window => {
		$window.classList.add('js-window-is-saving');
		const $draggableTarget = $window.querySelector('.titleframe');
		const windowName = $draggableTarget.querySelector('[name="title"]').textContent;
		$draggableTarget.addEventListener('mouseup', () => {
			state.windowsPos[windowName] = $window.getAttribute('style');
			saveState();
		});
	});
}

// Loads draggable UI windows position from state
function loadDraggedUIWindowsPositions() {
	const state = getState();

	Array.from(document.querySelectorAll('.window:not(.js-has-loaded-pos)')).forEach($window => {
		$window.classList.add('js-has-loaded-pos');
		const windowName = $window.querySelector('[name="title"]').textContent;
		const pos = state.windowsPos[windowName];
		if (pos) {
			$window.setAttribute('style', pos);
		}
	});
}

export default {
	name: 'Draggable Windows',
	description: 'Allows you to drag windows in the UI',
	run: ({ registerOnDomChange }) => {
		draggableUIWindows();
		saveDraggedUIWindows();
		loadDraggedUIWindowsPositions();

		// As windows open, we want to make them draggable
		registerOnDomChange(saveDraggedUIWindows);
		registerOnDomChange(draggableUIWindows);
		registerOnDomChange(loadDraggedUIWindowsPositions);
	},
};
