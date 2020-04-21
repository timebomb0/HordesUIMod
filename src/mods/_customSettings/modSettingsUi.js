import { makeElement } from '../../utils/misc';
import { setWindowOpen, setWindowClosed, WindowNames } from '../../utils/ui';

// TODO Should have 4 configs:
// Toggle for state.enableWindowDragging,
// state.enableFrameDragging,
// state.healthBarFadeColor = 'orange',
// state.healthBarFadeColor = 'red'
// state.healthBarFadePercent = 50,
// state.healthBarFadePercent = 100,
function createModSettings() {
	let modSettingsHTML = '';

	const customSettingsHTML = `
		<h3 class="textprimary">UI Mod Settings</h3>
		<div class="settings uimod-mod-settings js-mod-settings-list">${modSettingsHTML}</div>
		<p></p>
		<div class="btn purp js-close-mod-settings">Close</div>
	`;

	const $customSettings = makeElement({
		element: 'div',
		class: 'menu panel-black uimod-mod-settings-window uimod-custom-window js-mod-settings',
		content: customSettingsHTML,
	});
	document.body.appendChild($customSettings);

	setWindowOpen(WindowNames.modSettings);

	// And the close button for our custom UI
	document.querySelector('.js-close-mod-settings').addEventListener('click', removeModSettings);
}

function removeModSettings() {
	const $customSettingsWindow = document.querySelector('.js-mod-settings');
	$customSettingsWindow.parentNode.removeChild($customSettingsWindow);

	setWindowClosed(WindowNames.modSettings);
}

export { createModSettings, removeModSettings };
