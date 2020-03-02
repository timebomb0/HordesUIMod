import { getState, saveState } from './state';
import { makeElement } from './misc';
import * as chat from './chat';
import * as player from './player';
import mods from '../mods';

// TODO: Refactor how these UI functions are stored - this file is going to get too long and overcomplicated
// They should probably exist in some sort of ui.js file in their individual mod folders,
// and those ui.js files can then be exposed for other mods somehow
// May need to consider an architecture for individual mods exposing APIs for other mods

const WindowNames = {
	friendsList: 'friendsList',
	blockList: 'blockList',
	xpMeter: 'xpMeter',
	merchant: 'merchant',
	clan: 'clan',
	stash: 'stash',
	inventory: 'inventory',
	modToggler: 'modToggler',
};

function createModToggler() {
	const state = getState();

	let modTogglerHTML = '';
	mods.forEach(mod => {
		if (mod.required) return; // Don't allow toggling of required mods
		const isEnabled = !state.disabledMods.includes(mod.name);

		modTogglerHTML += `
			<div class="uimod-mod-name">${mod.name}</div>
			<div class="uimod-mod-desc">${mod.description}</div>
			<div class="uimod-mod-state">${isEnabled ? 'Turned on' : 'Turned off'}</div>
			${
				isEnabled
					? `<div class="btn orange js-disable-mod" data-mod-name="${mod.name}">Turn OFF mod</div>`
					: `<div class="btn blue js-enable-mod" data-mod-name="${mod.name}">Turn ON mod</div>`
			}
		`;
	});

	const customSettingsHTML = `
		<h3 class="textprimary">UI Mods</h3>
		<div class="uimod-disclaimer">Disclaimer: You MUST refresh the game after you enable/disable a mod for it to take effect.</div>
		<div class="settings uimod-mod-toggler js-mod-toggler-list">${modTogglerHTML}</div>
		<p></p>
		<div class="btn purp js-close-mod-toggler">Close</div>
	`;

	const $customSettings = makeElement({
		element: 'div',
		class: 'menu panel-black uimod-mod-toggler-window uimod-custom-window js-mod-toggler',
		content: customSettingsHTML,
	});
	document.body.appendChild($customSettings);

	setWindowOpen(WindowNames.modToggler);

	// Wire up all the disable/enable mod buttons
	Array.from(document.querySelectorAll('.js-disable-mod')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-mod-name');
			if (!state.disabledMods.includes(name)) {
				// It should never include the mod already, but juuust in case, we don't want to push it twice
				state.disabledMods.push(name);
				saveState();
			}

			// Refresh the window, retaining scroll position
			let $modList = document.querySelector('.js-mod-toggler-list');
			const tempScrollPos = $modList.scrollTop;
			removeModToggler();
			createModToggler();
			$modList = document.querySelector('.js-mod-toggler-list');
			$modList.scrollTop = tempScrollPos;
		});
	});
	Array.from(document.querySelectorAll('.js-enable-mod')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-mod-name');
			if (state.disabledMods.includes(name)) {
				state.disabledMods.splice(state.disabledMods.indexOf(name), 1);
				saveState();
			}

			// Refresh the window, retaining scroll position
			let $modList = document.querySelector('.js-mod-toggler-list');
			const tempScrollPos = $modList.scrollTop;
			removeModToggler();
			createModToggler();
			$modList = document.querySelector('.js-mod-toggler-list');
			$modList.scrollTop = tempScrollPos;
		});
	});
	// And the close button for our custom UI
	document.querySelector('.js-close-mod-toggler').addEventListener('click', removeModToggler);
}

function removeModToggler() {
	const $customSettingsWindow = document.querySelector('.js-mod-toggler');
	$customSettingsWindow.parentNode.removeChild($customSettingsWindow);

	setWindowClosed(WindowNames.blockList);
}

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

	setWindowOpen(WindowNames.blockList);

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

	setWindowClosed(WindowNames.blockList);
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
			chat.whisperPlayer(name);
		});
	});
	Array.from(document.querySelectorAll('.js-party-player')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-player-name');
			chat.partyPlayer(name);
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

	setWindowClosed(WindowNames.friendsList);
}

function toggleFriendsList() {
	if (isWindowOpen(WindowNames.friendsList)) {
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
		setWindowClosed(WindowNames.xpMeter);
	} else {
		setWindowOpen(WindowNames.xpMeter);
	}
}

function createXpMeter() {
	const $layoutContainer = document.querySelector(
		'body > div.layout > div.container:nth-child(1)',
	);

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

	const $xpMeterElement = makeElement({
		element: 'div',
		content: xpMeterHTMLString.trim(),
	});
	$layoutContainer.appendChild($xpMeterElement.firstChild);
}

function resetUiPositions() {
	const state = getState();

	state.windowsPos = {};
	saveState();
	chat.addChatMessage(
		'Please refresh the page for the reset frame & window positions to take effect.',
	);
}

function createScreenshotWarning() {
	// If it already exists kill it so we can remake it with a fresh fadeout
	if (document.querySelector('js-screenshot-warning')) {
		removeScreenshotWarning();
	}

	const $screenshotWarningContainer = makeElement({
		element: 'span',
		class: 'js-screenshot-warning uimod-screenshot-warning-container',
	});

	const $screenshotWarning = makeElement({
		element: 'span',
		class: 'uimod-screenshot-warning',
		content: 'Press F9 to exit screenshot mode',
	});

	$screenshotWarningContainer.appendChild($screenshotWarning);

	document.body.appendChild($screenshotWarningContainer);

	setTimeout(() => {
		$screenshotWarningContainer.classList.add('uimod-screenshot-warning-fadeout');
	}, 3000);
}

function removeScreenshotWarning() {
	const $screenshotWarning = document.querySelector('.js-screenshot-warning');

	// If it's already removed for some reason don't bother trying to remove it
	if (!$screenshotWarning) {
		return;
	}

	$screenshotWarning.parentNode.removeChild($screenshotWarning);
}

function createNavButton(shortname, icon, tooltip, callback) {
	const iconClass = 'js-' + shortname + '-icon';
	const tooltipClass = 'js-' + shortname + '-tooltip';

	// Create the icon
	const $newIcon = makeElement({
		element: 'div',
		class: 'btn border black ' + iconClass,
		content: icon,
	});

	// Add the icon to the right of Elixir icon
	const $elixirIcon = document.querySelector('#sysgem');
	$elixirIcon.parentNode.insertBefore($newIcon, $elixirIcon.nextSibling);

	// Add tooltip onhover
	$newIcon.addEventListener('mouseenter', () => {
		const $newTooltip = makeElement({
			element: 'div',
			class: 'btn border grey ' + tooltipClass,
			content: tooltip,
		});

		// Add the tooltip to the left of Elixir icon
		$elixirIcon.parentNode.insertBefore($newTooltip, $elixirIcon);
	});

	// Remove tooltip after hover
	$newIcon.addEventListener('mouseleave', () => {
		const $newTooltip = document.querySelector('.' + tooltipClass);

		$newTooltip.parentNode.removeChild($newTooltip);
	});

	// Call the appropriate function when clicked
	document.querySelector('.' + iconClass).addEventListener('click', callback);
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
	createModToggler,
	removeModToggler,
	createBlockList,
	removeBlockList,
	createFriendsList,
	removeFriendsList,
	toggleFriendsList,
	toggleXpMeterVisibility,
	createXpMeter,
	resetUiPositions,
	setWindowOpen,
	setWindowClosed,
	isWindowOpen,
	WindowNames,
	createScreenshotWarning,
	removeScreenshotWarning,
	createNavButton,
};
