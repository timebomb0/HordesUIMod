import { getState, saveState, getTempState } from '../../utils/state';
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
		helpers.mapResizeHandler(); // Update canvas size on initial load of saved map size
	}

	// On resize of map, resize canvas to match
	// Debouncing allows map to be visible while resizing
	const debouncedMapResize = debounce(helpers.mapResizeHandler, 1);
	const resizeObserverMap = new ResizeObserver(debouncedMapResize);
	helpers.mapResizeHandler();
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

function zoomMap() {
	const state = getState();

	// Wire up zooming
	const $map = document.querySelector('.container canvas:not(.js-map-zoom)');
	if (!$map) return;
	$map.classList.add('js-map-zoom');

	// On mouse wheel, zoom in/out 10%
	$map.addEventListener('wheel', event => {
		if (event.deltaY < 0) {
			// Zoom in on mouse scroll up
			if (state.mapZoomScaleFactor >= 3) return;

			// This is a neat problem - in JS, 0.7+0.1 is not 0.8, it's 0.7999999999999999 due to floating point issues- we round here to bypass that
			state.mapZoomScaleFactor = Math.round((state.mapZoomScaleFactor + 0.1) * 10) / 10;
			saveState();
			helpers.zoomAndCenterMap();
		} else {
			// Zoom out on mouse scroll down
			if (state.mapZoomScaleFactor <= 0.3) return;
			state.mapZoomScaleFactor = Math.round((state.mapZoomScaleFactor - 0.1) * 10) / 10;
			saveState();
			helpers.zoomAndCenterMap();
		}
	});

	// Initialize current zoom if user has zoomed
	helpers.zoomAndCenterMap();
}

export default {
	name: 'Resizable, zoomable map',
	description:
		'Allows you to resize the map by clicking and dragging from the bottom left. Also allows you to zoom the map with your mousewheel.',
	run: () => {
		resizableMap();
		zoomMap();
	},
};
