import { getTempState } from '../../utils/state';
import { makeElement } from '../../utils/misc';

function _getCooldownText(cd) {
	const timeBetweenCooldownChecks = cd.latestCooldownTimestamp - cd.initialCooldownTimestamp;
	const percentCompletedWithinTime = cd.initialCooldownPcntLeft - cd.latestCooldownPcntLeft;

	const secondsForOnePercent = timeBetweenCooldownChecks / percentCompletedWithinTime / 1000;

	return Math.floor(secondsForOnePercent * cd.latestCooldownPcntLeft);
}

function _handleCooldownUpdate(mutations) {
	const tempState = getTempState();

	mutations.forEach(mutation => {
		if (!mutation.target.classList.contains('cd')) return;

		const $cooldownOverlay = mutation.target;
		const skillId = $cooldownOverlay.parentNode.id;
		const cooldownPercentageLeft = parseInt($cooldownOverlay.style.height);

		let cdState = tempState.cooldownNums[skillId];

		// If cooldown percentage left is greater than the current initial cooldown pcnt left,
		// that means the skill cooldown counter is still tracking an old cooldown.
		// This can happen rarely if the user casts the ability the instant it comes off cooldown.
		// In this scenario, we want to reset the cooldown state.
		// If we don't reset the cooldown state, the cooldown number will be wrong because
		// `initialCooldownTime` will be from the previous cast, not the current cast.
		if (
			cdState.initialCooldownPcntLeft &&
			cooldownPercentageLeft >= cdState.initialCooldownPcntLeft
		) {
			cdState.initialCooldownTimestamp = null;
			cdState.initialCooldownPcntLeft = null;
			cdState.latestCooldownTimestamp = null;
			cdState.latestCooldownPcntLeft = null;
			cdState.calculationCount = 0;
		}

		if (!cdState.initialCooldownTimestamp) {
			cdState.initialCooldownTimestamp = Date.now();
			cdState.initialCooldownPcntLeft = cooldownPercentageLeft;
		}
		cdState.latestCooldownTimestamp = Date.now();
		cdState.latestCooldownPcntLeft = cooldownPercentageLeft;
		cdState.calculationCount++;

		// Minimum number of numbers to figure out an accurate enough real cooldown number = 3
		// Set the cooldown number in the UI
		if (cdState.calculationCount > 2) {
			const $cooldownNum = $cooldownOverlay.querySelector('.js-cooldown-num');
			$cooldownNum.innerText = _getCooldownText(cdState);
		}
	});
}

function addSkillCooldownNumbers() {
	const tempState = getTempState();

	// Add/update cooldowns
	const $skillCooldowns = Array.from(
		document.querySelectorAll('#skillbar .cd:not(.js-cooldown-num-initd'),
	);

	$skillCooldowns.forEach($cooldownOverlay => {
		$cooldownOverlay.classList.add('js-cooldown-num-initd');

		// Add cooldown element to overlay
		$cooldownOverlay.appendChild(
			makeElement({
				element: 'div',
				class: 'js-cooldown-num',
			}),
		);

		const cooldownObserver = new MutationObserver(_handleCooldownUpdate);

		// Add cooldown number and mutator to state
		const skillId = $cooldownOverlay.parentNode.id;
		tempState.cooldownNums[skillId] = {
			initialCooldownTimestamp: null,
			initialCooldownPcntLeft: null,
			latestCooldownTimestamp: null,
			latestCooldownPcntLeft: null,
			calculationCount: 0,
		};

		// Clear preexisting observer if it exists, then set new one to state
		if (tempState.cooldownObservers[skillId]) {
			tempState.cooldownObservers[skillId].disconnect();

			delete tempState.cooldownObservers[skillId];
		}
		tempState.cooldownObservers[skillId] = cooldownObserver;

		cooldownObserver.observe($cooldownOverlay, { attributes: true });
	});
}

export { addSkillCooldownNumbers };
