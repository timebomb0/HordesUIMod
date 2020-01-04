import { makeElement } from '../../utils/misc';
import { createBlockList, isWindowOpen, WindowNames, resetUiPositions } from '../../utils/ui';

function customSettings() {
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
	$settingsChoiceList.appendChild(
		makeElement({
			element: 'div',
			class: 'choice js-reset-ui-pos',
			content: 'Reset UI Positions',
		}),
	);

	// Upon click, we display our custom settings window UI
	document.querySelector('.js-blocked-players').addEventListener('click', createBlockList);

	// Reset positions immediately upon click
	document.querySelector('.js-reset-ui-pos').addEventListener('click', resetUiPositions);

	// If it was open when the game last closed keep it open
	if (isWindowOpen(WindowNames.blockList)) {
		createBlockList();
	}
}

export default {
	name: 'Custom settings',
	description:
		'Allows you to view and remove blocked players from the Settings window. Also adds Reset UI Position to settings',
	run: ({ registerOnDomChange }) => {
		customSettings();

		// If the settings window becomes visible/invisible, we want to update it
		registerOnDomChange(customSettings);
	},
};
