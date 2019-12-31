import { makeElement } from '../../utils/misc';
import { createBlockList, isWindowOpen } from '../../utils/ui';

function blockedPlayerSettings() {
	const $settings = document.querySelector('.divide:not(.js-settings-initd)');
	if (!$settings) {
		return;
	}

	$settings.classList.add('js-settings-initd');
	const $settingsChoiceList = $settings.querySelector('.choice').parentNode;
	$settingsChoiceList.appendChild(
		makeElement({
			element: 'div',
			class: 'choice js-blocked-players',
			content: 'Blocked players',
		}),
	);

	// Upon click, we display our custom settings window UI
	document.querySelector('.js-blocked-players').addEventListener('click', createBlockList);

	// If it was open when the game last closed keep it open
	if (isWindowOpen('blockList')) {
		createBlockList();
	}
}

export default {
	name: 'Blocked Players List',
	description: 'Allows you to view and remove blocked players from the Settings window',
	run: ({ registerOnDomChange }) => {
		blockedPlayerSettings();

		// If the settings window becomes visible/invisible, we want to update it
		registerOnDomChange(blockedPlayerSettings);
	},
};
