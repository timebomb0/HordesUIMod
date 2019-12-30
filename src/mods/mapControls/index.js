import { getState, saveState } from '../../utils/state';
import * as helpers from './helpers';
import { makeElement } from '../../utils/misc';

function mapControls() {
	const state = getState();

	const $map = document.querySelector('.container canvas');
	if (!$map.parentNode.classList.contains('js-map')) {
		$map.parentNode.classList.add('js-map');
	}
	const $mapContainer = document.querySelector('.js-map');

	const $mapButtons = makeElement({
		element: 'div',
		class: 'js-map-btns',
		content: `
            <button class="js-map-opacity-add">+</button>
            <button class="js-map-opacity-minus">-</button>
            <button class="js-map-reset">r</button>
        `,
	});

	// Add it right before the map container div
	$map.parentNode.insertBefore($mapButtons, $map);

	helpers.updateMapOpacity();

	const $addBtn = document.querySelector('.js-map-opacity-add');
	const $minusBtn = document.querySelector('.js-map-opacity-minus');
	const $resetBtn = document.querySelector('.js-map-reset');
	// Hide the buttons if map opacity is maxed/minimum
	if (state.mapOpacity === 100) {
		$addBtn.style.visibility = 'hidden';
	}
	if (state.mapOpacity === 0) {
		$minusBtn.style.visibility = 'hidden';
	}

	// Wire it up
	$addBtn.addEventListener('click', () => {
		// Update opacity
		state.mapOpacity += 10;
		saveState();
		helpers.updateMapOpacity();
	});

	$minusBtn.addEventListener('click', () => {
		// Update opacity
		state.mapOpacity -= 10;
		saveState();
		helpers.updateMapOpacity();
	});

	$resetBtn.addEventListener('click', () => {
		state.mapOpacity = 70;
		state.mapWidth = '174px';
		state.mapHeight = '174px';
		saveState();
		helpers.updateMapOpacity();
		$mapContainer.style.width = state.mapWidth;
		$mapContainer.style.height = state.mapHeight;
	});

	helpers.updateMapOpacity();
}

export default {
	name: 'Map controls',
	description:
		'Enables hovering over the minimap to show buttons that let you increase or decrease the opacity of the map, or reset the size+transparency of it',
	run: mapControls,
};
