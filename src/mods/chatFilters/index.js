import * as chat from '../../utils/chat';
import { saveState, getState } from '../../utils/state';

// Remove GM chat filter state for users of v1.2.5 and prior
function removeGmChatFilter() {
	const state = getState();

	let stateUpdated = false;

	state.chatTabs = state.chatTabs.map(chatTabState => {
		if (!chatTabState) return chatTabState;

		if (chatTabState.filters && chatTabState.filters.hasOwnProperty('GM')) {
			delete chatTabState.filters.GM;
			stateUpdated = true;
		}
		return chatTabState;
	});

	if (state.chat) {
		delete state.chat;
		stateUpdated = true;
	}

	if (stateUpdated) saveState();
}

export default {
	name: 'Chat filters',
	description: "Filters all chat, e.g. ensuring blocked users' messages are not visible in chat.",
	run: ({ registerOnChatChange }) => {
		removeGmChatFilter();

		// Whenever chat changes, we want to filter it
		registerOnChatChange(chat.filterAllChat);
	},
};
