import { getState } from '../../utils/state';
import * as player from '../../utils/player';
import { makeElement } from '../../utils/misc';

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
	document.querySelector('.js-friends-list-icon').addEventListener('click', showFriendsList);
}

function showFriendsList() {
	const state = getState();

	if (document.querySelector('.js-friends-list')) {
		// Don't open the friends list twice.
		return;
	}
	let friendsListHTML = '';
	Object.keys(state.friendsList)
		.sort()
		.forEach(friendName => {
			friendsListHTML += `
			<div data-player-name="${friendName}">${friendName}</div>
			<div class="btn blue js-whisper-player" data-player-name="${friendName}">Whisper</div>
			<div class="btn blue js-party-player" data-player-name="${friendName}">Party invite</div>
			<div class="btn orange js-unfriend-player" data-player-name="${friendName}">X</div>
			<input type="text" class="js-friend-note" data-player-name="${friendName}" value="${state
				.friendNotes[friendName] || ''}"></input>
		`;
		});

	const customFriendsWindowHTML = `
		<h3 class="textprimary">Friends list</h3>
		<div class="uimod-friends">${friendsListHTML}</div>
		<p></p>
		<div class="btn purp js-close-custom-friends-list">Close</div>
	`;

	const $customFriendsList = makeElement({
		element: 'div',
		class: 'menu panel-black js-friends-list uimod-custom-window',
		content: customFriendsWindowHTML,
	});
	document.body.appendChild($customFriendsList);

	// Wire up the buttons
	Array.from(document.querySelectorAll('.js-whisper-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			player.whisperPlayer(name);
		});
	});
	Array.from(document.querySelectorAll('.js-party-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			player.partyPlayer(name);
		});
	});
	Array.from(document.querySelectorAll('.js-unfriend-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			player.unfriendPlayer(name);

			// Remove the blocked player from the list
			Array.from(
				document.querySelectorAll(`.js-friends-list [data-player-name="${name}"]`),
			).forEach($element => {
				$element.parentNode.removeChild($element);
			});
		});
	});
	Array.from(document.querySelectorAll('.js-friend-note')).forEach($element => {
		$element.addEventListener('change', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			state.friendNotes[name] = clickEvent.target.value;
		});
	});

	// The close button for our custom UI
	document
		.querySelector('.js-close-custom-friends-list')
		.addEventListener('click', hideFriendsList);
}

function hideFriendsList() {
	const $friendsListWindow = document.querySelector('.js-friends-list');
	$friendsListWindow.parentNode.removeChild($friendsListWindow);
}

export default {
	name: 'Friends list',
	description: 'Allows access to your friends list from the top right F icon',
	run: ({ registerOnStateChange }) => {
		customFriendsList();

		registerOnStateChange((oldState, newState) => {
			const oldFriendsListPlayers = Object.keys(oldState.friendsList);
			const newFriendsListPlayers = Object.keys(newState.friendsList);

			// Find players in either state that aren't in the other state
			const newlyFriendedPlayers = Object.keys(newState.friendsList).filter(
				playerName => !oldFriendsListPlayers.includes(playerName),
			);
			const newlyUnfriendedPlayers = Object.keys(oldState.friendsList).filter(
				playerName => !newFriendsListPlayers.includes(playerName),
			);

			console.log(newlyUnfriendedPlayers);
			console.log(oldState.friendsList);
			console.log(newState.friendsList);

			// A new player was friended/unfriended, reload UI if it's open already
			if (newlyFriendedPlayers.length > 0 || newlyUnfriendedPlayers.length > 0) {
				if (document.querySelector('.js-friends-list')) {
					hideFriendsList();
					showFriendsList();
				}
			}
		});
	},
};
