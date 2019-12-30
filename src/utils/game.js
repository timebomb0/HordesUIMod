// Gets the node of a tooltip for any element
// Must be `await`'d to use, e.g. `await getTooltipContent($element)`
async function getTooltipContent($elementToHoverOver) {
	$elementToHoverOver.dispatchEvent(new Event('pointerenter'));
	const closeTooltipPromise = new Promise(resolve =>
		setTimeout(() => {
			const $window = $elementToHoverOver.parentNode.parentNode.parentNode;
			resolve($window.querySelector('.slotdescription').cloneNode(true));
			$elementToHoverOver.dispatchEvent(new Event('pointerleave'));
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

export { getTooltipContent, getWindow };
