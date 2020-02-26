import { getState } from '../../utils/state';
import { resizeChat } from './helpers';

function resizableChat() {
	const state = getState();

	// Add the appropriate classes
	const $chatContainer = document.querySelector('#chat').parentNode;
	$chatContainer.classList.add('js-chat-resize');

	// Load initial chat and map size
	if (state.chatWidth && state.chatHeight) {
		resizeChat();
	}

	// Save chat size on resize - Disabled for now as this isn't fully working yet
	// const resizeObserverChat = new ResizeObserver(() => {
	// 	const chatWidthStr = window
	// 		.getComputedStyle($chatContainer, null)
	// 		.getPropertyValue('width');
	// 	const chatHeightStr = window
	// 		.getComputedStyle($chatContainer, null)
	// 		.getPropertyValue('height');

	// 	const hasWidthChanged = state.chatWidth !== chatWidthStr;
	// 	const hasHeightChanged = state.chatHeight !== chatHeightStr;

	// 	// If width or height has changed by 20 or more (arbitrary number), chat has been resized
	// 	// by game, rather than by user. Don't override state in this case.
	// 	//
	// 	// Instead, chat should be resized to match state. This helps avoid chat resize being reset
	// 	// by the game when the game reinitializes, i.e. when user is inactive and not focusing on game for prolonged period of time.
	// 	const widthChangeAmount = Math.abs(parseInt(chatWidthStr) - parseInt(state.chatWidth));
	// 	const heightChangeAmount = Math.abs(parseInt(chatHeightStr) - parseInt(state.chatHeight));
	// 	console.log(widthChangeAmount, heightChangeAmount);
	// 	if (widthChangeAmount >= 20 || heightChangeAmount >= 20) {
	// 		resizeChat();
	// 		return;
	// 	}

	// 	if (hasWidthChanged) state.chatWidth = chatWidthStr;
	// 	if (hasHeightChanged) state.chatHeight = chatHeightStr;
	// 	if (hasWidthChanged || hasHeightChanged) saveState();
	// });
	// resizeObserverChat.observe($chatContainer);
}

export default {
	name: 'Resizable chat',
	description: 'Allows you to resize chat by clicking and dragging from the bottom right of chat',
	run: resizableChat,
};
