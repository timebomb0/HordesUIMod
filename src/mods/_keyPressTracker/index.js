import { getTempState } from '../../utils/state';

// Note: For a split second after these event handlers are added,
// They may not actually be listening.
// e.g. Refresh page with inventory open, immediately control+right click item
//      to copy its stats. It won't work because `keydown` didn't register the keydown event yet
// Doesn't look like there's anything we can do about it, just something to keep in mind.
function keyPressTracker() {
	const tempState = getTempState();

	window.addEventListener('keydown', keyEvent => {
		if (keyEvent.key === 'Control') {
			tempState.keyModifiers.control = true;
		} else if (keyEvent.key === 'Alt') {
			tempState.keyModifiers.alt = true;
		} else if (keyEvent.key === 'Shift') {
			// Shouldn't set keyModifiers.shift if we're programatically doing it while getting tooltip content
			// tempState.gettingTooltipContentShiftPress should only be `true` if user already isn't pressing shift
			// See game.js `getTooltipContent` for more details
			if (tempState.gettingTooltipContentShiftPress) {
				return;
			}

			tempState.keyModifiers.shift = true;
		}
	});
	window.addEventListener('keyup', keyEvent => {
		if (keyEvent.key === 'Control') {
			tempState.keyModifiers.control = false;
		} else if (keyEvent.key === 'Alt') {
			tempState.keyModifiers.alt = false;
		} else if (keyEvent.key === 'Shift') {
			tempState.keyModifiers.shift = false;
		}
	});

	// If page ever regains focus, e.g. tabbing back in after tabbing out, make sure we reset our modifiers.
	// This prevents things like holding control, leaving the tab without releasing it, then coming back in and
	// the game will think you are still holding it, even if you're not.
	window.addEventListener('focus', () => {
		tempState.keyModifiers.control = false;
		tempState.keyModifiers.alt = false;
		tempState.keyModifiers.shift = false;
	});
}

export default {
	name: '[REQUIRED] Key press tracker',
	description:
		'Identifies when you are pressing Ctrl/etc key modifiers, which is used by some other mods',
	run: keyPressTracker,
};
