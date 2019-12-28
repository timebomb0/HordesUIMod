import { getState, saveState } from './state';
import * as chat from './chat';

function friendPlayer(playerName) {
	const state = getState();

	if (state.friendsList[playerName]) {
		return;
	}

	state.friendsList[playerName] = true;
	addChatMessage(`${playerName} has been added to your friends list.`);
	saveState();
}

function unfriendPlayer(playerName) {
	const state = getState();

	if (!state.friendsList[playerName]) {
		return;
	}

	delete state.friendsList[playerName];
	delete state.friendNotes[playerName];
	addChatMessage(`${playerName} is no longer on your friends list.`);
	saveState();
}

// Adds player to block list, to be filtered out of chat
function blockPlayer(playerName) {
	const state = getState();

	if (state.blockList[playerName]) {
		return;
	}

	state.blockList[playerName] = true;
	chat.filterAllChat();
	addChatMessage(`${playerName} has been blocked.`);
	saveState();
}

// Removes player from block list and makes their messages visible again
function unblockPlayer(playerName) {
	const state = getState();

	delete state.blockList[playerName];
	addChatMessage(`${playerName} has been unblocked.`);
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
