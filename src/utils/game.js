// Gets the node of a tooltip for any element
// Must be `await`'d to use, e.g. `await getTooltipContent($element)`
async function getTooltipContent($elementToHoverOver) {
	$elementToHoverOver.dispatchEvent(new Event('pointerenter'));
	const closeTooltipPromise = new Promise(resolve =>
		setTimeout(() => {
			resolve($elementToHoverOver.querySelector('.slotdescription').cloneNode(true));
			$elementToHoverOver.dispatchEvent(new Event('pointerleave'));
		}, 0),
	);
	const $tooltip = await closeTooltipPromise;
	return $tooltip;
}
