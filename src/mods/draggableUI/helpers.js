// Credit: https://stackoverflow.com/a/14234618 (Has been slightly modified)
// $draggedElement is the item that will be dragged.
// $dragTrigger is the element that must be held down to drag $draggedElement
function dragElement($draggedElement, $dragTrigger) {
	let offset = [0, 0];
	let isDown = false;
	$dragTrigger.addEventListener(
		'mousedown',
		function(e) {
			isDown = true;
			offset = [
				$draggedElement.offsetLeft - e.clientX,
				$draggedElement.offsetTop - e.clientY,
			];
		},
		true,
	);
	document.addEventListener(
		'mouseup',
		function() {
			isDown = false;
		},
		true,
	);

	document.addEventListener(
		'mousemove',
		function(e) {
			event.preventDefault();
			if (isDown) {
				$draggedElement.style.left = e.clientX + offset[0] + 'px';
				$draggedElement.style.top = e.clientY + offset[1] + 'px';
			}
		},
		true,
	);
}

export { dragElement };
