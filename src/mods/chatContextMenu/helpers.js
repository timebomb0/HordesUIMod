import { getState } from '../../utils/state';

// Makes chat context menu visible and appear under the mouse
function showChatContextMenu(name, mousePos) {
	const state = getState();

	// Right before we show the context menu, we want to handle showing/hiding Friend/Unfriend
	const $contextMenu = document.querySelector('.js-chat-context-menu');
	$contextMenu
		.querySelector('[name="friend"]')
		.classList.toggle('js-hidden', !!state.friendsList[name]);
	$contextMenu
		.querySelector('[name="unfriend"]')
		.classList.toggle('js-hidden', !state.friendsList[name]);

	$contextMenu.querySelector('.js-name').textContent = name;
	$contextMenu.setAttribute(
		'style',
		`display: block; left: ${mousePos.x}px; top: ${mousePos.y}px;`,
	);
}

export { showChatContextMenu };
