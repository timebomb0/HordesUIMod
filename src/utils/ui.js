import { getState, saveState } from './state';
import { makeElement } from './misc';
import * as chat from './chat';

const WindowNames = {
	merchant: 'merchant',
	clan: 'clan',
	stash: 'stash',
	inventory: 'inventory',
};

function resetUiPositions() {
	const state = getState();

	state.windowsPos = {};
	saveState();
	chat.addChatMessage(
		'Please refresh the page for the reset frame & window positions to take effect.',
	);
}

function createNavButton(shortname, icon, tooltip, callback) {
	const iconClass = 'js-' + shortname + '-icon';
	const tooltipClass = 'js-' + shortname + '-tooltip';

	// Create the icon
	const $newIcon = makeElement({
		element: 'div',
		class: 'btn border black ' + iconClass,
		content: icon,
	});

	// Add the icon to the right of Elixir icon
	const $elixirIcon = document.querySelector('#sysgem');
	$elixirIcon.parentNode.insertBefore($newIcon, $elixirIcon.nextSibling);

	// Add tooltip onhover
	$newIcon.addEventListener('mouseenter', () => {
		const $newTooltip = makeElement({
			element: 'div',
			class: 'btn border grey ' + tooltipClass,
			content: tooltip,
		});

		// Add the tooltip to the left of Elixir icon
		$elixirIcon.parentNode.insertBefore($newTooltip, $elixirIcon);
	});

	// Remove tooltip after hover
	$newIcon.addEventListener('mouseleave', () => {
		const $newTooltip = document.querySelector('.' + tooltipClass);

		$newTooltip.parentNode.removeChild($newTooltip);
	});

	// Call the appropriate function when clicked
	document.querySelector('.' + iconClass).addEventListener('click', callback);
}

// state.openWindows should always only be managed by this file
// Sometimes we want to track when a UI window we don't control is opened/closed
// We use these methods to help facilitate that
// To use these methods correctly, you need to track when the window opens _and_ when it closes
// If you don't _need_ to do both those things, then don't do that, and don't use these methods
function setWindowOpen(windowName) {
	const state = getState();

	state.openWindows[windowName] = true;
	saveState();
}

function setWindowClosed(windowName) {
	const state = getState();

	state.openWindows[windowName] = false;
	saveState();
}

function isWindowOpen(windowName) {
	const state = getState();
	return state.openWindows[windowName];
}

export {
	resetUiPositions,
	setWindowOpen,
	setWindowClosed,
	isWindowOpen,
	WindowNames,
	createNavButton,
};
