import {
	createFriendsList,
	toggleFriendsList,
	isWindowOpen,
	WindowNames,
	createNavButton,
} from '../../utils/ui';

// The F icon and the UI that appears when you click it
function customFriendsList() {
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
