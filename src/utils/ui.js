import { getState, saveState } from './state';
import { makeElement } from './misc';
import * as player from './player';

let windowNames = {
	friendsList: 'friendsList',
	blockList: 'blockList',
	xpMeter: 'xpMeter',
	merchant: 'merchant',
};

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
		class: 'menu panel-black uimod-custom-window js-blocked-list',
		content: customSettingsHTML,
	});
	document.body.appendChild($customSettings);

	setWindowOpen(windowNames.blockList);

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
	document.querySelector('.js-close-custom-settings').addEventListener('click', removeBlockList);
}

function removeBlockList() {
	const $customSettingsWindow = document.querySelector('.js-blocked-list');
	$customSettingsWindow.parentNode.removeChild($customSettingsWindow);

	setWindowClosed(windowNames.blockList);
}

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

	setWindowOpen(windowNames.friendsList);

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
		.addEventListener('click', removeFriendsList);
}

function removeFriendsList() {
	const $friendsListWindow = document.querySelector('.js-friends-list');
	$friendsListWindow.parentNode.removeChild($friendsListWindow);

	setWindowClosed(windowNames.friendsList);
}

function toggleFriendsList() {
	if (isWindowOpen(windowNames.friendsList)) {
		removeFriendsList();
	} else {
		createFriendsList();
	}
}

function toggleXpMeterVisibility() {
	const xpMeterContainer = document.querySelector('.js-xpmeter');

	// Make it if it doesn't exist for some reason
	if (!xpMeterContainer) {
		createXpMeter();
	}

	xpMeterContainer.style.display = xpMeterContainer.style.display === 'none' ? 'block' : 'none';

	// Save whether xpMeter is currently open or closed in the state
	if (xpMeterContainer.style.display === 'none') {
		setWindowClosed(windowNames.xpMeter);
	} else {
		setWindowOpen(windowNames.xpMeter);
	}
}

function createXpMeter() {
	const $layoutContainer = document.querySelector(
		'body > div.layout > div.container:nth-child(1)',
	);
	const $dpsMeterToggleElement = document.querySelector('#systrophy');
	const $xpMeterToggleElement = makeElement({
		element: 'div',
		class: 'js-sysxp js-xpmeter-icon btn border black',
		content: 'XP',
	});

	const xpMeterHTMLString = `
        <div class="l-corner-lr container uimod-xpmeter-1 js-xpmeter" style="display: none">
            <div class="window panel-black uimod-xpmeter-2">
                <div class="titleframe uimod-xpmeter-2">
                    <img src="/assets/ui/icons/trophy.svg?v=3282286" class="titleicon svgicon uimod-xpmeter-2">
                        <div class="textprimary title uimod-xpmeter-2">
                            <div name="title">Experience / XP</div>
                        </div>
                        <img src="/assets/ui/icons/cross.svg?v=3282286" class="js-xpmeter-close-icon btn black svgicon">
                </div>
                <div class="slot uimod-xpmeter-2" style="">
                    <div class="wrapper uimod-xpmeter-1">
                        <div class="bar  uimod-xpmeter-3" style="z-index: 0;">
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP per minute:</span>
                                <span class="right uimod-xpmeter-3 js-xpm">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP per hour:</span>
                                <span class="right uimod-xpmeter-3 js-xph">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP Gained:</span>
                                <span class="right uimod-xpmeter-3 js-xpg">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP Left:</span>
                                <span class="right uimod-xpmeter-3 js-xpl">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">Session Time: </span>
                                <span class="right uimod-xpmeter-3 js-xp-s-time">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">Time to lvl: </span>
                                <span class="right uimod-xpmeter-3 js-xp-time">-</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid buttons marg-top uimod-xpmeter-1 js-xpmeter-reset-button">
                        <div class="btn grey">Reset</div>
                    </div>
                </div>
            </div>
        </div>
    `;

	$dpsMeterToggleElement.parentNode.insertBefore(
		$xpMeterToggleElement,
		$dpsMeterToggleElement.nextSibling,
	);

	const $xpMeterElement = makeElement({
		element: 'div',
		content: xpMeterHTMLString.trim(),
	});
	$layoutContainer.appendChild($xpMeterElement.firstChild);
}

// state.openWindows should always only be managed by this file
// Sometimes we want to track when a UI window we don't control is opened/closed
// We use these methods to help facilitate that
// To use these methods correctly, you need to track when the window opens _and_ when it closes
// If you don't _need_ to do both those things, then don't do that, and don't use these methods
function setWindowOpen(windowName) {
	const state = getState();

	state.openWindows[windowName] = true;
	saveState();
}

function setWindowClosed(windowName) {
	const state = getState();

	state.openWindows[windowName] = false;
	saveState();
}

function isWindowOpen(windowName) {
	const state = getState();
	return state.openWindows[windowName];
}

export {
	createBlockList,
	removeBlockList,
	createFriendsList,
	removeFriendsList,
	toggleFriendsList,
	toggleXpMeterVisibility,
	createXpMeter,
	setWindowOpen,
	setWindowClosed,
	isWindowOpen,
	windowNames,
};
