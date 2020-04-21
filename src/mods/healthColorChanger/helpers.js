import { getState } from '../../utils/state';

const HEALTH_PERCENTAGE_COLORS_ORANGE = {
	100: 'linear-gradient(0deg, #34CB49 0%, #2da640 49%, #34CB49 50%)',
	90: 'linear-gradient(0deg, #4AB844 0%, #3D963B 49%, #4AB844 50%)',
	80: 'linear-gradient(0deg, #61A540 0%, #4D8637 49%, #61A540 50%)',
	70: 'linear-gradient(0deg, #77923C 0%, #5E7733 49%, #77923C 50%)',
	60: 'linear-gradient(0deg, #8E7F37 0%, #6E672F 49%, #8E7F37 50%)',
	50: 'linear-gradient(0deg, #A46D33 0%, #7E582A 49%, #A46D33 50%)',
	40: 'linear-gradient(0deg, #BB8A2F 0%, #8F4826 49%, #BB8A2F 50%)',
	30: 'linear-gradient(0deg, #D1772A 0%, #9F3922 49%, #D1772A 50%)',
	20: 'linear-gradient(0deg, #E86426 0%, #AF291E 49%, #E86426 50%)',
	10: 'linear-gradient(0deg, #E04222 0%, #C01A1A 49%, #E04222 50%)',
};
const HEALTH_PERCENTAGE_COLORS_RED = {
	100: 'linear-gradient(0deg, #34CB49 0%, #2da640 49%, #34CB49 50%)',
	90: 'linear-gradient(0deg, #4AB844 0%, #3D963B 49%, #4AB844 50%)',
	80: 'linear-gradient(0deg, #61A540 0%, #4D8637 49%, #61A540 50%)',
	70: 'linear-gradient(0deg, #77923C 0%, #5E7733 49%, #77923C 50%)',
	60: 'linear-gradient(0deg, #8E7F37 0%, #6E672F 49%, #8E7F37 50%)',
	50: 'linear-gradient(0deg, #A46D33 0%, #7E582A 49%, #A46D33 50%)',
	40: 'linear-gradient(0deg, #BB5A2F 0%, #8F4826 49%, #BB5A2F 50%)',
	30: 'linear-gradient(0deg, #D1472A 0%, #9F3922 49%, #D1472A 50%)',
	20: 'linear-gradient(0deg, #E83426 0%, #AF291E 49%, #E83426 50%)',
	10: 'linear-gradient(0deg, #E02222 0%, #C01A1A 49%, #E02222 50%)',
};

// TODO: Consider separate colors for fading that starts when they're below 50%
//  	 Abruptly fading to a dark green/orange color when they hit 50% may not look great
function handleHealthChange($healthBar) {
	const state = getState();

	// Clear the custom background for enemies
	// This is necessary because when switching from an allied target to an enenmy target,
	// the DOM element remains the same, but the class changes, hence this observer
	// is still active.
	if ($healthBar.classList.contains('bgenemy')) {
		if ($healthBar.style.background) {
			$healthBar.style.background = '';
		}
		return;
	}

	let colors = {};
	if (state.healthBarFadeColor === 'red') {
		colors = HEALTH_PERCENTAGE_COLORS_RED;
	} else if (state.healthBarFadeColor === 'orange') {
		colors = HEALTH_PERCENTAGE_COLORS_ORANGE;
	}
	const healthPercentage = parseFloat($healthBar.style.width);

	let color = '';
	// If health bar is set not to fade until X%, then use the default 100% color
	// if we're not supposed to fade yet
	if (state.healthBarFadePercentage > healthPercentage) {
		color = colors[100];
	} else if (healthPercentage < 10) {
		color = colors[10];
	} else if (healthPercentage < 20) {
		color = colors[20];
	} else if (healthPercentage < 30) {
		color = colors[30];
	} else if (healthPercentage < 40) {
		color = colors[40];
	} else if (healthPercentage < 50) {
		color = colors[50];
	} else if (healthPercentage < 60) {
		color = colors[60];
	} else if (healthPercentage < 70) {
		color = colors[70];
	} else if (healthPercentage < 80) {
		color = colors[80];
	} else if (healthPercentage < 90) {
		color = colors[90];
	} else {
		color = colors[100];
	}

	if ($healthBar.style.background !== color) {
		$healthBar.style.background = color;
	}
}

export { handleHealthChange };
