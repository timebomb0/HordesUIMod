// Influenced by: https://gist.github.com/remarkablemark/5002d27442600510d454a5aeba370579 & https://stackoverflow.com/a/45831670
// $draggedElement is the item that will be dragged.
// $dragTrigger is optional, if passed, this element that must be held down to drag $draggedElement
// If $dragTrigger is not passed, clicking anywhere on $draggedElement will drag it
function dragElement($draggedElement, $dragTrigger) {
	let offset = [0, 0];
	let mouseDownPos = [0, 0];
	let elementPos = [0, 0];
	let isDown = false;

	const $trigger = $dragTrigger || $draggedElement;
	$trigger.addEventListener(
		'mousedown',
		e => {
			isDown = true;
			// Offset is used when there is a separate $dragTrigger
			offset = [
				$draggedElement.offsetLeft - e.clientX,
				$draggedElement.offsetTop - e.clientY,
			];

			// mouseDownPos and elementPos are used when $draggedElement is also the trigger
			mouseDownPos = [e.clientX, e.clientY];
			elementPos = [
				parseInt($draggedElement.style.left) || 0,
				parseInt($draggedElement.style.top) || 0,
			];
		},
		true,
	);
	document.addEventListener(
		'mouseup',
		() => {
			isDown = false;
		},
		true,
	);

	document.addEventListener(
		'mousemove',
		e => {
			e.preventDefault();
			if (isDown) {
				const deltaX = $dragTrigger
					? e.clientX + offset[0]
					: elementPos[0] + e.clientX - mouseDownPos[0];
				const deltaY = $dragTrigger
					? e.clientY + offset[1]
					: elementPos[1] + e.clientY - mouseDownPos[1];

				$draggedElement.style.left = `${deltaX}px`;
				$draggedElement.style.top = `${deltaY}px`;
			}
		},
		true,
	);
}

export { dragElement };
