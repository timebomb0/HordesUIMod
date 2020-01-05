import { getTempState } from './state';

// Gets the node of a tooltip for any element, emulates shift keypress to get tooltip with quality details
// Must be `await`'d to use, e.g. `await getTooltipContent($element)`
// Optionally pass `getDetailedTooltips` as `true` if you want detailed tooltips by holding shift
// ^ is laggier, do not use when looking at more than one item
async function getTooltipContent($elementToHoverOver, getDetailedTooltips) {
	const tempState = getTempState();

	// Emulate holding down shift when getting tooltip
	// Don't need to emulate if user is already holding it down
	if (getDetailedTooltips && !tempState.keyModifiers.shift) {
		// Set this so the keymodifiers mod knows our shift press shouldn't be tracked in tempState
		tempState.gettingTooltipContentShiftPress = true;
		document.body.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Shift',
			}),
		);
	}
	$elementToHoverOver.dispatchEvent(new Event('pointerenter'));
	const closeTooltipPromise = new Promise(resolve =>
		setTimeout(() => {
			const resolveWithTooltip = () => {
				// If there is no slotdescription at this point, the item element passed very likely has no tooltip
				const $tooltip = document.querySelector('.slotdescription');
				if (!$tooltip || !$tooltip.cloneNode) {
					resolve(false);
				} else {
					resolve($tooltip.cloneNode(true));
				}
				if (tempState.gettingTooltipContentShiftPress) {
					// Release our emulated shift press
					document.body.dispatchEvent(
						new KeyboardEvent('keyup', {
							bubbles: true,
							cancelable: true,
							key: 'Shift',
						}),
					);
					tempState.gettingTooltipContentShiftPress = false;
				}

				$elementToHoverOver.dispatchEvent(new Event('pointerleave'));
			};

			// Very occasionally the 0ms wait time on our timeout doesn't show the tooltip,
			// so we set a second timeout to account for this. Not the most perfect user experience,
			// but it rarely hapens, and it's better than getting an error.
			if (getDetailedTooltips && !document.querySelector('.slotdescription')) {
				setTimeout(resolveWithTooltip, 1);
			} else {
				resolveWithTooltip();
			}
		}, 0),
	);
	const $tooltip = await closeTooltipPromise;
	return $tooltip;
}

// Use this to get a specific window, rather than using the svelte class, which is not preferable
function getWindow(windowTitle) {
	const $specificWindowTitle = Array.from(
		document.querySelectorAll('.window [name="title"]'),
	).find($windowTitle => $windowTitle.textContent.toLowerCase() === windowTitle.toLowerCase());
	return $specificWindowTitle
		? $specificWindowTitle.parentNode.parentNode.parentNode
		: $specificWindowTitle;
}

// Emulates right click, e.g. to open context menu on item in inventory
function triggerRightClickMenu($element) {
	$element.dispatchEvent(new PointerEvent('pointerup', { button: 2, isTrusted: true }));
}

export { getTooltipContent, getWindow, triggerRightClickMenu };
