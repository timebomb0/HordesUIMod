import { getState, getTempState } from '../../utils/state';
import * as helpers from './helpers';
import { debounce } from '../../utils/misc';

function resizableMap() {
	const state = getState();
	const tempState = getTempState();

	const $map = document.querySelector('.container canvas').parentNode;
	const $canvas = $map.querySelector('canvas');
	$map.classList.add('js-map-resize');

	// Track whether we're clicking (resizing) map or not
	// Used to detect if resize changes are manually done, or from minimizing/maximizing map (with [M])
	$map.addEventListener('mousedown', () => {
		tempState.clickingMap = true;
	});
	// Sometimes the mouseup event may be registered outside of the map - we account for this
	document.body.addEventListener('mouseup', () => {
		tempState.clickingMap = false;
	});

	if (state.mapWidth && state.mapHeight) {
		$map.style.width = state.mapWidth;
		$map.style.height = state.mapHeight;
		helpers.onMapResize(); // Update canvas size on initial load of saved map size
	}

	// On resize of map, resize canvas to match
	// Debouncing allows map to be visible while resizing
	const debouncedMapResize = debounce(helpers.onMapResize, 1);
	const resizeObserverMap = new ResizeObserver(debouncedMapResize);
	helpers.onMapResize();
	resizeObserverMap.observe($map);

	// We debounce the canvas resize, so it doesn't resize every single
	// pixel you move when resizing the DOM. If this were to happen,
	// resizing would constantly be interrupted. You'd have to resize a tiny bit,
	// lift left click, left click again to resize a tiny bit more, etc.
	// Resizing is smooth when we debounce this canvas.
	const debouncedTriggerResize = debounce(helpers.triggerMapResize, 50);
	const resizeObserverCanvas = new ResizeObserver(debouncedTriggerResize);
	resizeObserverCanvas.observe($canvas);
}

export default {
	name: 'Resizable map',
	description: 'Allows you to resize the map by clicking and dragging from the bottom left',
	run: resizableMap,
};
