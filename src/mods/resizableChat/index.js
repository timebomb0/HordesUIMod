import { getState, saveState } from '../../utils/state';

function resizableChat() {
	const state = getState();

	// Add the appropriate classes
	const $chatContainer = document.querySelector('#chat').parentNode;
	$chatContainer.classList.add('js-chat-resize');

	// Load initial chat and map size
	if (state.chatWidth && state.chatHeight) {
		$chatContainer.style.width = state.chatWidth;
		$chatContainer.style.height = state.chatHeight;
	}

	// Save chat size on resize
	const resizeObserverChat = new ResizeObserver(() => {
		const chatWidthStr = window
			.getComputedStyle($chatContainer, null)
			.getPropertyValue('width');
		const chatHeightStr = window
			.getComputedStyle($chatContainer, null)
			.getPropertyValue('height');

		const hasWidthChanged = state.chatWidth !== chatWidthStr;
		const hasHeightChanged = state.chatHeight !== chatHeightStr;
		if (hasWidthChanged) state.chatWidth = chatWidthStr;
		if (hasHeightChanged) state.chatHeight = chatHeightStr;
		if (hasWidthChanged || hasHeightChanged) saveState();
	});
	resizeObserverChat.observe($chatContainer);
}

export default {
	name: 'Resizable chat',
	description: 'Allows you to resize chat by clicking and dragging from the bottom right of chat',
	run: resizableChat,
};
