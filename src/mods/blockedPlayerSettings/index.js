import { getState } from '../../utils/state';
import { makeElement } from '../../utils/misc';
import * as player from '../../utils/player';

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
	document.querySelector('.js-blocked-players').addEventListener('click', showBlockedList);
}

function showBlockedList() {
	const state = getState();

	let blockedPlayersHTML = '';
	Object.keys(state.blockList)
		.sort()
		.forEach(blockedName => {
			blockedPlayersHTML += `
			<div data-player-name="${blockedName}">${blockedName}</div>
			<div class="btn orange js-unblock-player" data-player-name="${blockedName}">Unblock player</div>
		`;
		});

	const customSettingsHTML = `
		<h3 class="textprimary">Blocked players</h3>
		<div class="settings uimod-settings">${blockedPlayersHTML}</div>
		<p></p>
		<div class="btn purp js-close-custom-settings">Close</div>
	`;

	const $customSettings = makeElement({
		element: 'div',
		class: 'menu panel-black js-custom-settings uimod-custom-window js-blocked-list',
		content: customSettingsHTML,
	});
	document.body.appendChild($customSettings);

	// Wire up all the unblock buttons
	Array.from(document.querySelectorAll('.js-unblock-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			player.unblockPlayer(name);

			// Remove the blocked player from the list
			Array.from(
				document.querySelectorAll(`.js-blocked-list [data-player-name="${name}"]`),
			).forEach($element => {
				$element.parentNode.removeChild($element);
			});
		});
	});
	// And the close button for our custom UI
	document.querySelector('.js-close-custom-settings').addEventListener('click', hideBlockedList);
}

function hideBlockedList() {
	const $customSettingsWindow = document.querySelector('.js-blocked-list');
	$customSettingsWindow.parentNode.removeChild($customSettingsWindow);
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

export { showBlockedList, hideBlockedList };
