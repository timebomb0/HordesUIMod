import { getState, saveState } from './state';
import * as chat from './chat';
import * as ui from './ui';

function friendPlayer(playerName) {
	const state = getState();

	if (state.friendsList[playerName]) {
		return;
	}

	state.friendsList[playerName] = true;
	chat.addChatMessage(`${playerName} has been added to your friends list.`);
	saveState();

	// If UI is open remake it with new changes
	if (ui.isWindowOpen(ui.WindowNames.friendsList)) {
		ui.removeFriendsList();
		ui.createFriendsList();
	}
}

function unfriendPlayer(playerName) {
	const state = getState();

	if (!state.friendsList[playerName]) {
		return;
	}

	delete state.friendsList[playerName];
	delete state.friendNotes[playerName];
	chat.addChatMessage(`${playerName} is no longer on your friends list.`);
	saveState();

	// If UI is open remake it with new changes
	if (ui.isWindowOpen(ui.WindowNames.friendsList)) {
		ui.removeFriendsList();
		ui.createFriendsList();
	}
}

// Adds player to block list, to be filtered out of chat
function blockPlayer(playerName) {
	const state = getState();

	if (state.blockList[playerName]) {
		return;
	}

	state.blockList[playerName] = true;
	chat.filterAllChat();
	chat.addChatMessage(`${playerName} has been blocked.`);
	saveState();

	// If UI is open remake it with new changes
	if (ui.isWindowOpen(ui.WindowNames.blockList)) {
		ui.removeBlockList();
		ui.createBlockList();
	}
}

// Removes player from block list and makes their messages visible again
function unblockPlayer(playerName) {
	const state = getState();

	delete state.blockList[playerName];
	chat.addChatMessage(`${playerName} has been unblocked.`);
	saveState();

	// Make messages visible again
	const $chatNames = Array.from(
		document.querySelectorAll(`.js-line-blocked[data-chat-name="${playerName}"]`),
	);
	$chatNames.forEach($name => {
		$name.classList.remove('js-line-blocked');
		const $line = $name.parentNode.parentNode.parentNode;
		$line.classList.remove('js-line-blocked');
	});
}

export { friendPlayer, unfriendPlayer, blockPlayer, unblockPlayer };
