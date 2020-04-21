import { makeElement } from '../../utils/misc';
import * as player from '../../utils/player';
import { getState } from '../../utils/state';
import { setWindowOpen, setWindowClosed, WindowNames } from '../../utils/ui';

function createBlockList() {
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
		class: 'menu panel-black uimod-custom-window js-block-list',
		content: customSettingsHTML,
	});
	document.body.appendChild($customSettings);

	setWindowOpen(WindowNames.blockList);

	// Wire up all the unblock buttons
	Array.from(document.querySelectorAll('.js-unblock-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			player.unblockPlayer(name);

			// Remove the blocked player from the list
			Array.from(
				document.querySelectorAll(`.js-block-list [data-player-name="${name}"]`),
			).forEach($element => {
				$element.parentNode.removeChild($element);
			});
		});
	});
	// And the close button for our custom UI
	document.querySelector('.js-close-custom-settings').addEventListener('click', removeBlockList);
}

function removeBlockList() {
	const $customSettingsWindow = document.querySelector('.js-block-list');
	$customSettingsWindow.parentNode.removeChild($customSettingsWindow);

	setWindowClosed(WindowNames.blockList);
}

export { createBlockList, removeBlockList };
