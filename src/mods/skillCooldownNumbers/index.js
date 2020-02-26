import { getTempState } from '../../utils/state';
import { addSkillCooldownNumbers } from './helpers';

function skillCooldownNumbers() {
	const tempState = getTempState();

	// If not initialized, initialize with initial observer
	const $skillBar = document.querySelector('#skillbar:not(.js-cooldowns-skillbar-initd');
	if (!$skillBar) return;

	$skillBar.classList.add('js-cooldowns-skillbar-initd');
	if (tempState.skillBarObserver) {
		tempState.skillBarObserver.disconnect();
		delete tempState.skillBarObserver;
	}

	tempState.skillBarObserver = new MutationObserver(addSkillCooldownNumbers);
	tempState.skillBarObserver.observe($skillBar, {
		subtree: true,
		childList: true,
		attributes: true,
	});
	addSkillCooldownNumbers();
}

export default {
	name: 'Skill cooldown numbers',
	description: 'Overlays time left on cooldown over skill icons',
	run: () => {
		skillCooldownNumbers();
	},
};
