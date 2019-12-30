import { getState, getTempState, saveState } from '../../utils/state';
import * as helpers from './helpers';
import { toggleXpMeterVisibility, createXpMeter } from '../../utils/ui';
import { stat } from 'fs';

// TODO: Consider adding start button to start interval, and stop after X minutes of no EXP
//       Or maybe watch XP bar and start it once XP bar first moves?
// Adds XP Meter DOM icon and window, starts continuous interval to get current xp over time
function xpMeter() {
	const state = getState();
	const tempState = getTempState();

	createXpMeter();

	// If it was open when the game last closed keep it open
	if (state.openWindows.openXpMeter) {
		toggleXpMeterVisibility();
	}

	// Wire up icon and xpmeter window
	document.querySelector('.js-sysxp').addEventListener('click', toggleXpMeterVisibility);
	document
		.querySelector('.js-xpmeter-close-icon')
		.addEventListener('click', toggleXpMeterVisibility);
	document
		.querySelector('.js-xpmeter-reset-button')
		.addEventListener('click', helpers.resetXpMeterState);

	const currentXp = helpers.getCurrentXp();
	const currentCharLvl = helpers.getCurrentCharacterLvl();
	if (currentXp !== state.xpMeterState.currentXp) state.xpMeterState.currentXp = currentXp;
	if (currentCharLvl !== state.xpMeterState.currentLvl)
		state.xpMeterState.currentLvl = currentCharLvl;
	saveState();

	if (tempState.xpMeterInterval) clearInterval(tempState.xpMeterInterval);

	// every second we run the operations for xp meter, update xps, calc delta, etc
	// TODO Cleanup: This interval may not be cleaned up if the UI mod reinitializes,
	//               e.g. user is away from tab for a while then comes back
	//               Should confirm if this is an issue, and try to fix it if possible.
	tempState.xpMeterInterval = setInterval(() => {
		if (!document.querySelector('#expbar')) {
			return;
		}

		const currentXp = helpers.getCurrentXp();
		const nextLvlXp = helpers.getNextLevelXp();
		const currentLvl = helpers.getCurrentCharacterLvl();

		// Only update and save state if it has changed
		const gainedXp = currentXp - state.xpMeterState.currentXp;
		const xpGains = currentXp - state.xpMeterState.currentXp;
		const averageXp =
			state.xpMeterState.xpGains.length > 0
				? state.xpMeterState.xpGains.reduce((a, b) => a + b, 0) /
				  state.xpMeterState.xpGains.length
				: 0;

		// Our algorithms and session time depend on an xpGain being pushed every second, even if it is 0
		state.xpMeterState.xpGains.push(xpGains); // array of xp deltas every second
		if (gainedXp !== 0) state.xpMeterState.gainedXp += gainedXp;
		if (currentXp !== state.xpMeterState.currentXp) state.xpMeterState.currentXp = currentXp;
		if (averageXp !== state.xpMeterState.averageXp) state.xpMeterState.averageXp = averageXp;
		saveState();

		if (document.querySelector('.js-xpmeter')) {
			document.querySelector('.js-xpm').textContent = parseInt(
				(state.xpMeterState.averageXp * 60).toFixed(0),
			).toLocaleString();
			document.querySelector('.js-xph').textContent = parseInt(
				(state.xpMeterState.averageXp * 60 * 60).toFixed(0),
			).toLocaleString();
			document.querySelector(
				'.js-xpg',
			).textContent = state.xpMeterState.gainedXp.toLocaleString();
			document.querySelector('.js-xpl').textContent = (
				nextLvlXp - currentXp
			).toLocaleString();
			document.querySelector('.js-xp-s-time').textContent = helpers.msToString(
				state.xpMeterState.xpGains.length * 1000,
			);
			// need a positive integer for averageXp to calc time left
			if (state.xpMeterState.averageXp > 0)
				document.querySelector('.js-xp-time').textContent = helpers.msToString(
					((nextLvlXp - currentXp) / state.xpMeterState.averageXp) * 1000,
				);
		}

		if (state.xpMeterState.currentLvl < currentLvl) {
			helpers.resetXpMeterState();
			state.xpMeterState.currentLvl = currentLvl;
			saveState();
		}
	}, 1000);
}

export default {
	name: 'XP Meter',
	description:
		"Tracks your XP/minute and displays how much XP you're getting and lets you know how long until you level up",
	run: xpMeter,
};
