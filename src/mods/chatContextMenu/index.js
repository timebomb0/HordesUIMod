import { getTempState } from '../../utils/state';
import { makeElement } from '../../utils/misc';
import * as helpers from './helpers';
import * as chat from '../../utils/chat';
import * as player from '../../utils/player';

// This creates the initial chat context menu DOM (which starts as hidden)
function createChatContextMenu() {
	const tempState = getTempState();

	if (document.querySelector('.js-chat-context-menu')) {
		return;
	}

	let contextMenuHTML = `
        <div class="js-name">...</div>
        <div class="choice" name="party">Party invite</div>
        <div class="choice" name="whisper">Whisper</div>
        <div class="choice" name="friend">Friend</div>
		<div class="choice" name="unfriend">Unfriend</div>
		<div class="choice" name="copy">Copy name</div>
        <div class="choice" name="block">Block</div>
    `;
	document.body.appendChild(
		makeElement({
			element: 'div',
			class: 'panel context border grey js-chat-context-menu',
			content: contextMenuHTML,
		}),
	);

	const $chatContextMenu = document.querySelector('.js-chat-context-menu');
	$chatContextMenu.querySelector('[name="party"]').addEventListener('click', () => {
		chat.partyPlayer(tempState.chatName);
	});
	$chatContextMenu.querySelector('[name="whisper"]').addEventListener('click', () => {
		chat.whisperPlayer(tempState.chatName);
	});
	$chatContextMenu.querySelector('[name="friend"]').addEventListener('click', () => {
		player.friendPlayer(tempState.chatName);
	});
	$chatContextMenu.querySelector('[name="unfriend"]').addEventListener('click', () => {
		player.unfriendPlayer(tempState.chatName);
	});
	$chatContextMenu.querySelector('[name="copy"]').addEventListener('click', () => {
		navigator.clipboard.writeText(tempState.chatName);
	});
	$chatContextMenu.querySelector('[name="block"]').addEventListener('click', () => {
		player.blockPlayer(tempState.chatName);
	});
}

// This opens a context menu when you click a user's name in chat
function chatContextMenu() {
	const tempState = getTempState();

	const addContextMenu = ($name, name) => {
		$name.classList.add('js-is-context-menu-initd');
		// Add name to element so we can target it in CSS, e.g. when filtering chat for block list
		$name.setAttribute('data-chat-name', name);

		const showContextMenu = clickEvent => {
			// TODO: Is there a way to pass the name to showChatContextMenumethod, instead of storing in tempState?
			tempState.chatName = name;
			helpers.showChatContextMenu(name, {
				x: clickEvent.pageX,
				y: clickEvent.pageY,
			});
		};
		$name.addEventListener('click', showContextMenu); // Left click
		$name.addEventListener('contextmenu', showContextMenu); // Right click works too
	};
	Array.from(document.querySelectorAll('#chat .name:not(.js-is-context-menu-initd)')).forEach(
		$name => {
			addContextMenu($name, $name.textContent);
		},
	);
	// `textf0` is the VG faction, `textf1` is the BL faction - we want to support both with our whisper context menu
	Array.from(
		document.querySelectorAll(
			'.textwhisper .textf1:not(.js-is-context-menu-initd), .textwhisper .textf0:not(.js-is-context-menu-initd)',
		),
	).forEach($whisperName => {
		// $whisperName's textContent is "to [name]" or "from [name]", so we cut off the first word
		let name = $whisperName.textContent.split(' ');
		name.shift(); // Remove the first word
		name = name.join(' ');
		addContextMenu($whisperName, name);
	});
}

// Close chat context menu if clicking outside of it
function closeChatContextMenu(clickEvent) {
	const $target = clickEvent.target;
	// If clicking on name or directly on context menu, don't close it
	// Still closes if clicking on context menu item
	if (
		$target.classList.contains('js-is-context-menu-initd') ||
		$target.classList.contains('js-chat-context-menu')
	) {
		return;
	}

	const $contextMenu = document.querySelector('.js-chat-context-menu');
	$contextMenu.style.display = 'none';
}

export default {
	name: 'Chat Context Menu',
	description:
		'Displays a menu when you click on a player, allowing you to whisper/party/friend/block them',
	run: ({ registerOnLeftClick, registerOnChatChange }) => {
		createChatContextMenu();
		chatContextMenu();

		// When we click anywhere on the page outside of our chat context menu, we want to close the menu
		registerOnLeftClick(closeChatContextMenu);

		// Register event listeners for each name when a new chat message appears
		registerOnChatChange(chatContextMenu);
	},
};
