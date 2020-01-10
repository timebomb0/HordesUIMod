import { createScreenshotWarning, removeScreenshotWarning } from '../../utils/ui';

function toggleScreenshotWarning(keyEvent) {
	// All of the UI elements we want to hide
	const $expBar = document.querySelector('#expbar'); // Player exp bar
	const $actionBar = document.querySelector('.actionbarcontainer'); // Skillbar & player/target hp bar
	const $mainUI = document.querySelector('.layout > .container'); // The rest of the UI

	// On release of F9 hide/show these UI elements and the screenshot warning
	if (keyEvent.keyCode == '120') {
		if ($expBar.style.display != 'none') {
			$mainUI.style.display = 'none';
			$expBar.style.display = 'none';
			$actionBar.style.display = 'none';

			createScreenshotWarning();
		} else {
			$mainUI.style.display = 'block';
			$expBar.style.display = 'block';
			$actionBar.style.display = 'block';

			removeScreenshotWarning();
		}
	}
}

export default {
	name: 'Screenshot Mode',
	description: 'Hookup F9 key to toggle game UI visibly for cleaner screenshots',
	run: ({ registerOnKeyUp }) => {
		registerOnKeyUp(toggleScreenshotWarning);
	},
};
