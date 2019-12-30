import { makeElement } from '../../utils/misc';
import { createFriendsList } from '../../utils/ui';

// The F icon and the UI that appears when you click it
function customFriendsList() {
	var friendsIconElement = makeElement({
		element: 'div',
		class: 'btn border black js-friends-list-icon',
		content: 'F',
	});
	// Add the icon to the right of Elixir icon
	const $elixirIcon = document.querySelector('#sysgem');
	$elixirIcon.parentNode.insertBefore(friendsIconElement, $elixirIcon.nextSibling);

	// Create the friends list UI
	document.querySelector('.js-friends-list-icon').addEventListener('click', createFriendsList);
}

export default {
	name: 'Friends list',
	description: 'Allows access to your friends list from the top right F icon',
	run: customFriendsList,
};
