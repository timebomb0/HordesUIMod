import { makeElement } from '../../utils/misc';
import {
	createBlockList,
	createModToggler,
	isWindowOpen,
	WindowNames,
	resetUiPositions,
} from '../../utils/ui';

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
			class: 'choice js-mod-toggler-open',
			content: 'Toggle Mods',
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

	// Upon click, display custom mod toggler window UI
	document.querySelector('.js-mod-toggler-open').addEventListener('click', createModToggler);

	// If it was open when the game last closed keep it open
	if (isWindowOpen(WindowNames.blockList)) {
		createBlockList();
	}
	if (isWindowOpen(WindowNames.modToggler)) {
		createModToggler();
	}
}

export default {
	name: '[REQUIRED] Custom settings',
	description:
		'Do not disable this! Allows you to view and remove blocked players from the Settings window. Adds Reset UI Position and Mod Toggler to settings.',
	run: ({ registerOnDomChange }) => {
		customSettings();

		// If the settings window becomes visible/invisible, we want to update it
		registerOnDomChange(customSettings);
	},
	required: true,
};
