import * as helpers from './helpers';
import { getState, saveState } from '../../utils/state';

// Drag all windows by their header
function draggableUIWindows() {
	Array.from(document.querySelectorAll('.window:not(.js-can-move)')).forEach($window => {
		$window.classList.add('js-can-move');
		helpers.dragElement($window, $window.querySelector('.titleframe'));
	});

	Array.from(
		document.querySelectorAll(`
		.partyframes:not(.js-can-move),
		#ufplayer:not(.js-can-move),
		#uftarget:not(.js-can-move),
		#skillbar:not(.js-can-move)
	`),
	).forEach($frame => {
		$frame.classList.add('js-can-move');
		helpers.dragElement($frame);
	});
}

// Save dragged UI windows position to state
function saveDraggedUIWindows() {
	const state = getState();

	Array.from(document.querySelectorAll('.window:not(.js-ui-is-saving)')).forEach($window => {
		$window.classList.add('js-ui-is-saving');
		const $draggableTarget = $window.querySelector('.titleframe');
		const windowName = $draggableTarget.querySelector('[name="title"]').textContent;
		$draggableTarget.addEventListener('mouseup', () => {
			state.windowsPos[windowName] = $window.getAttribute('style');
			saveState();
		});
	});

	const saveFramePos = ($element, name) => {
		if (!$element) return;

		$element.classList.add('js-ui-is-saving');
		$element.addEventListener('mouseup', () => {
			state.windowsPos[name] = $element.getAttribute('style');
		});
	};

	saveFramePos(document.querySelector('.partyframes:not(.js-ui-is-saving)'), 'partyFrame');
	saveFramePos(document.querySelector('#ufplayer:not(.js-ui-is-saving)'), 'playerFrame');
	saveFramePos(document.querySelector('#uftarget:not(.js-ui-is-saving)'), 'targetFrame');
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

	const loadFramePos = ($element, name) => {
		if (!$element) return;

		$element.classList.add('js-has-loaded-pos');
		const pos = state.windowsPos[name];
		if (pos) {
			$element.setAttribute('style', pos);
		}
	};

	loadFramePos(document.querySelector('.partyframes:not(.js-has-loaded-pos)'), 'partyFrame');
	loadFramePos(document.querySelector('#ufplayer:not(.js-has-loaded-pos)'), 'playerFrame');
	loadFramePos(document.querySelector('#uftarget:not(.js-has-loaded-pos)'), 'targetFrame');
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
