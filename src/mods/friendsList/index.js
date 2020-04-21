import {
	createFriendsList,
	toggleFriendsList,
	isWindowOpen,
	WindowNames,
	createNavButton,
} from '../../utils/ui';
import { registerChatMenuItem } from '../chatContextMenu';
import { friendPlayer, unfriendPlayer } from '../../utils/player';
import { getState, getTempState } from '../../utils/state';

function customFriendsList() {
	const state = getState();
	const tempState = getTempState();

	WindowNames.friendsList = 'friends-list';

	registerChatMenuItem({
		id: 'friend',
		label: 'Friend',
		handleClick: () => {
			friendPlayer(tempState.chatName);
		},
		handleVisibilityCheck: () => {
			return !state.friendsList[tempState.chatName];
		},
	});
	registerChatMenuItem({
		id: 'unfriend',
		label: 'Unfriend',
		handleClick: () => {
			unfriendPlayer(tempState.chatName);
		},
		handleVisibilityCheck: () => {
			return !!state.friendsList[tempState.chatName];
		},
	});
	createNavButton('friendslist', 'F', 'Friends List', toggleFriendsList);

	// If it was open when the game last closed keep it open
	if (isWindowOpen(WindowNames.friendsList)) {
		createFriendsList();
	}
}

export default {
	name: 'Friends list',
	description: 'Allows access to your friends list from the top right F icon',
	run: customFriendsList,
};
