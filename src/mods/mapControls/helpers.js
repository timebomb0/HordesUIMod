import { getState } from '../../utils/state';

// On load, update map opacity to match state
// We modify the opacity of the canvas and the background color alpha of the parent container
// We do this to allow our opacity buttons to be visible on hover with 100% opacity
// (A surprisingly difficult enough task to require this implementation)
function updateMapOpacity() {
	const state = getState();
	const $map = document.querySelector('.container canvas');
	const $mapContainer = document.querySelector('.js-map');

	$map.style.opacity = String(state.mapOpacity / 100);
	const mapContainerBgColor = window
		.getComputedStyle($mapContainer, null)
		.getPropertyValue('background-color');
	// Credit for this regexp + This opacity+rgba dual implementation: https://stackoverflow.com/questions/16065998/replacing-changing-alpha-in-rgba-javascript
	let opacity = state.mapOpacity / 100;
	// This is a slightly lazy browser workaround to fix a bug.
	// If the opacity is `1`, and it sets `rgba` to `1`, then the browser changes the
	// rgba to rgb, dropping the alpha. We could account for that and add the `alpha` back in
	// later, but setting the max opacity to very close to 1 makes sure the issue never crops up.
	// Fun fact: 0.99 retains the alpha, but setting this to 0.999 still causes the browser to drop the alpha. Rude.
	if (opacity === 1) {
		opacity = 0.99;
	}
	const newBgColor = mapContainerBgColor.replace(/[\d\.]+\)$/g, `${opacity})`);
	$mapContainer.style['background-color'] = newBgColor;

	// Update the button opacity
	const $addBtn = document.querySelector('.js-map-opacity-add');
	const $minusBtn = document.querySelector('.js-map-opacity-minus');
	// Hide plus button if the opacity is max
	if (state.mapOpacity === 100) {
		$addBtn.style.visibility = 'hidden';
	} else {
		$addBtn.style.visibility = 'visible';
	}
	// Hide minus button if the opacity is lowest
	if (state.mapOpacity === 0) {
		$minusBtn.style.visibility = 'hidden';
	} else {
		$minusBtn.style.visibility = 'visible';
	}
}

export { updateMapOpacity };
