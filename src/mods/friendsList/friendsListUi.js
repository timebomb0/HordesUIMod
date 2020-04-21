import { getState } from '../../utils/state';
import { unfriendPlayer } from '../../utils/player';
import { partyPlayer, whisperPlayer } from '../../utils/chat';
import { makeElement } from '../../utils/misc';
import { WindowNames, setWindowClosed, isWindowOpen, setWindowOpen } from '../../utils/ui';

function createFriendsList() {
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
			<input type="text" class="js-friend-note" placeholder="You can add a note here" data-player-name="${friendName}" value="${state
				.friendNotes[friendName] || ''}"></input>
		`;
		});

	const customFriendsWindowHTML = `
		<div class="titleframe uimod-friends-list-helper">
				<div class="textprimary title uimod-friends-list-helper">
					<div name="title">Friends list</div>
				</div>
				<img src="/assets/ui/icons/cross.svg?v=3282286" class="js-close-custom-friends-list btn black svgicon">
		</div>
		<div class="uimod-friends-intro">To add someone as a friend, click their name in chat and then click Friend :)</div>
		<div class="uimod-friends">${friendsListHTML}</div>
	`;

	const $customFriendsList = makeElement({
		element: 'div',
		class: 'menu window panel-black js-friends-list uimod-custom-window',
		content: customFriendsWindowHTML,
	});
	document.body.appendChild($customFriendsList);

	setWindowOpen(WindowNames.friendsList);

	// Wire up the buttons
	Array.from(document.querySelectorAll('.js-whisper-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			whisperPlayer(name);
		});
	});
	Array.from(document.querySelectorAll('.js-party-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			partyPlayer(name);
		});
	});
	Array.from(document.querySelectorAll('.js-unfriend-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			unfriendPlayer(name);

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
		.addEventListener('click', removeFriendsList);
}

function removeFriendsList() {
	const $friendsListWindow = document.querySelector('.js-friends-list');
	$friendsListWindow.parentNode.removeChild($friendsListWindow);

	setWindowClosed(WindowNames.friendsList);
}

function toggleFriendsList() {
	if (isWindowOpen(WindowNames.friendsList)) {
		removeFriendsList();
	} else {
		createFriendsList();
	}
}

export { createFriendsList, removeFriendsList, toggleFriendsList };
