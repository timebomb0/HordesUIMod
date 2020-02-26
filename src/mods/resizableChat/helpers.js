import { getState } from '../../utils/state';

// Resizes chat to match what's in state
function resizeChat() {
	const state = getState();
	const $chatContainer = document.querySelector('.js-chat-resize');

	$chatContainer.style.width = state.chatWidth;
	$chatContainer.style.height = state.chatHeight;
}

export { resizeChat };
