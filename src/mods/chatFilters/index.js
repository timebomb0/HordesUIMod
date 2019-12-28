import * as chat from '../../utils/chat';
import { getState } from '../../utils/state';
import { makeElement } from '../../utils/misc';

// Creates DOM elements for custom chat filters
function newChatFilters() {
	const state = getState();

	const $channelselect = document.querySelector('.channelselect');
	if (!document.querySelector(`.js-chat-gm`)) {
		const $gm = makeElement({
			element: 'small',
			class: `btn border black js-chat-gm ${state.chat.GM ? '' : 'textgrey'}`,
			content: 'GM',
		});
		$channelselect.appendChild($gm);
	}
}

// Wire up new chat buttons to toggle in state+ui
function newChatFilterButtons() {
	const state = getState();

	const $chatGM = document.querySelector(`.js-chat-gm`);
	$chatGM.addEventListener('click', () => {
		chat.setGMChatVisibility(!state.chat.GM);
	});
}

export default {
	name: 'Chat filters',
	description: 'Enables custom chat filters: GM chat',
	run: ({ registerOnChatChange }) => {
		newChatFilters();
		newChatFilterButtons();

		// Whenever chat changes, we want to filter it
		registerOnChatChange(chat.filterAllChat);
	},
};
