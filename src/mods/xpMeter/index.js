import { getState, getTempState, saveState } from '../../utils/state';
import * as helpers from './helpers';
import { makeElement } from '../../utils/misc';

// Adds XP Meter DOM icon and window, starts continuous interval to get current xp over time
function xpMeter() {
	const state = getState();
	const tempState = getTempState();

	const $layoutContainer = document.querySelector(
		'body > div.layout > div.container:nth-child(1)',
	);
	const $dpsMeterToggleElement = document.querySelector('#systrophy');
	const $xpMeterToggleElement = makeElement({
		element: 'div',
		class: 'js-sysxp js-xpmeter-icon btn border black',
		content: 'XP',
	});

	const xpMeterHTMLString = `
        <div class="l-corner-lr container uimod-xpmeter-1 js-xpmeter" style="display: none">
            <div class="window panel-black uimod-xpmeter-2">
                <div class="titleframe uimod-xpmeter-2">
                    <img src="/assets/ui/icons/trophy.svg?v=3282286" class="titleicon svgicon uimod-xpmeter-2">
                        <div class="textprimary title uimod-xpmeter-2">
                            <div name="title">Experience / XP</div>
                        </div>
                        <img src="/assets/ui/icons/cross.svg?v=3282286" class="js-xpmeter-close-icon btn black svgicon">
                </div>
                <div class="slot uimod-xpmeter-2" style="">
                    <div class="wrapper uimod-xpmeter-1">
                        <div class="bar  uimod-xpmeter-3" style="z-index: 0;">
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP per minute:</span>
                                <span class="right uimod-xpmeter-3 js-xpm">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP per hour:</span>
                                <span class="right uimod-xpmeter-3 js-xph">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP Gained:</span>
                                <span class="right uimod-xpmeter-3 js-xpg">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP Left:</span>
                                <span class="right uimod-xpmeter-3 js-xpl">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">Session Time: </span>
                                <span class="right uimod-xpmeter-3 js-xp-s-time">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">Time to lvl: </span>
                                <span class="right uimod-xpmeter-3 js-xp-time">-</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid buttons marg-top uimod-xpmeter-1 js-xpmeter-reset-button">
                        <div class="btn grey">Reset</div>
                    </div>
                </div>
            </div>
        </div>
    `;

	$dpsMeterToggleElement.parentNode.insertBefore(
		$xpMeterToggleElement,
		$dpsMeterToggleElement.nextSibling,
	);

	const $xpMeterElement = makeElement({
		element: 'div',
		content: xpMeterHTMLString.trim(),
	});
	$layoutContainer.appendChild($xpMeterElement.firstChild);

	// Wire up icon and xpmeter window
	document.querySelector('.js-sysxp').addEventListener('click', helpers.toggleXpMeterVisibility);
	document
		.querySelector('.js-xpmeter-close-icon')
		.addEventListener('click', helpers.toggleXpMeterVisibility);
	document
		.querySelector('.js-xpmeter-reset-button')
		.addEventListener('click', helpers.resetXpMeterState);

	state.xpMeterState.currentXp = helpers.getCurrentXp();
	state.xpMeterState.currentLvl = helpers.getCurrentCharacterLvl();
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

		state.xpMeterState.gainedXp += currentXp - state.xpMeterState.currentXp;
		state.xpMeterState.xpGains.push(currentXp - state.xpMeterState.currentXp); // array of xp deltas every second
		state.xpMeterState.currentXp = currentXp;
		state.xpMeterState.averageXp =
			state.xpMeterState.xpGains.reduce((a, b) => a + b) / state.xpMeterState.xpGains.length;
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
