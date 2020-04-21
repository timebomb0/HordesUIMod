import { makeElement } from '../../utils/misc';
import { isWindowOpen, WindowNames, resetUiPositions } from '../../utils/ui';
import { createModToggler } from './modTogglerUi';
import { createModSettings } from './modSettingsUi';

const registeredSettings = [];

function customSettings() {
	const $settings = document.querySelector('.divide:not(.js-settings-initd)');
	if (!$settings) {
		return;
	}

	$settings.classList.add('js-settings-initd');
	const $settingsChoiceList = $settings.querySelector('.choice').parentNode;

	// Append all the registered settings links
	registeredSettings.forEach(({ windowName, label }) => {
		$settingsChoiceList.appendChild(
			makeElement({
				element: 'div',
				class: `choice js-${windowName}-open`,
				content: label,
			}),
		);
	});

	// TODO: Make this a setting in the new settings window
	$settingsChoiceList.appendChild(
		makeElement({
			element: 'div',
			class: 'choice js-reset-ui-pos',
			content: 'Reset UI Positions',
		}),
	);

	// Reset positions immediately upon click
	document.querySelector('.js-reset-ui-pos').addEventListener('click', resetUiPositions);

	// Upon settings item click, open window
	registeredSettings.forEach(({ windowName, handleOpenWindow }) => {
		document
			.querySelector(`.js-${windowName}-open`)
			.addEventListener('click', handleOpenWindow);
	});

	// If it was open when the game last closed keep it open
	registeredSettings.forEach(({ windowName, handleOpenWindow }) => {
		if (isWindowOpen(windowName) && !document.querySelector(`.js-${windowName}`)) {
			handleOpenWindow();
		}
	});
}

// `windowName` is used to create class names and check if the window is open in the UI
//		Pass `ui.WindowNames.x` to this argument.
//		Setting the window name in ui.js WindowNames ensure other mods can check if the window is open, just in case they need to
// `handleOpenWindow` is a callback that is triggered when the user clicks the settings item.
//		The window it opens must have a css class matching `js-${windowName}`, e.g. if windowName is `block-list`, the CSS class for your created window must be `js-block-list`
// `label` is the text visible in the Settings menu
function registerSettingsMenuItem({ windowName, handleOpenWindow, label }) {
	registeredSettings.push({ windowName, handleOpenWindow, label });
}

// TODO: function to register settings ption in the custom mod settings window

export default {
	name: '[REQUIRED] Custom settings',
	description:
		'Do not disable this Adds Reset UI Position, Mod Toggler, and Mod Settings to Hordes settings window. Allows for custom settings to be added',
	run: ({ registerOnDomChange }) => {
		// Register ui.js window names
		WindowNames.modToggler = 'mod-toggler';
		WindowNames.uiModSettings = 'mod-settings';

		// TODO: Finish
		// // Register settings
		// registerSettingsMenuItem({
		// 	windowName: WindowNames.uiModSettings,
		// 	handleOpenWindow: createModSettings,
		// 	label: 'UI Mod Settings',
		// });
		registerSettingsMenuItem({
			windowName: WindowNames.modToggler,
			handleOpenWindow: createModToggler,
			label: 'Toggle Mods',
		});

		customSettings();

		// If the settings window becomes visible/invisible, we want to update it
		registerOnDomChange(customSettings);
	},
	required: true,
};

export { registerSettingsMenuItem };
