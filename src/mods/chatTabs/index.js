import * as helpers from './helpers';
import { getState, getTempState, saveState } from '../../utils/state';
import { makeElement, uuid } from '../../utils/misc';

// Creates DOM elements and wires them up for custom chat tabs and chat tab config
// Note: Should be done after creating new custom chat filters
function customChatTabs() {
	const state = getState();
	const tempState = getTempState();

	// Create the chat tab configuration DOM
	const $chatTabConfigurator = makeElement({
		element: 'div',
		class: 'uimod-chat-tab-config js-chat-tab-config',
		content: `
            <h1>Chat Tab Config</h1>
            <div class="uimod-chat-tab-config-grid">
                <div>Name</div><input type="text" class="js-chat-tab-name" value="untitled"></input>
                <div class="btn orange js-remove-chat-tab">Remove</div><div class="btn blue js-save-chat-tab">Ok</div>
            </div>
        `,
	});
	document.body.append($chatTabConfigurator);

	// Wire it up
	document.querySelector('.js-remove-chat-tab').addEventListener('click', () => {
		// Remove the chat tab from state
		const editedChatTab = state.chatTabs.find(tab => tab.id === tempState.editedChatTabId);
		const editedChatTabIndex = state.chatTabs.indexOf(editedChatTab);
		state.chatTabs.splice(editedChatTabIndex, 1);

		// Remove the chat tab from DOM
		const $chatTab = document.querySelector(`[data-tab-id="${tempState.editedChatTabId}"]`);
		$chatTab.parentNode.removeChild($chatTab);

		// If we just removed the currently selected chat tab
		if (tempState.editedChatTabId === state.selectedChatTabId) {
			// Select the chat tab to the left of the removed one
			const nextChatTabIndex = editedChatTabIndex === 0 ? 0 : editedChatTabIndex - 1;
			helpers.selectChatTab(state.chatTabs[nextChatTabIndex].id);
		}

		// Close chat tab config
		document.querySelector('.js-chat-tab-config').style.display = 'none';
	});

	document.querySelector('.js-save-chat-tab').addEventListener('click', () => {
		// Set new chat tab name in DOM
		const $chatTab = document.querySelector(`[data-tab-id="${state.selectedChatTabId}"]`);
		const newName = document.querySelector('.js-chat-tab-name').value;
		$chatTab.textContent = newName;

		// Set new chat tab name in state
		// `selectedChatTab` is a reference on `state.chatTabs`, so updating it above still updates it in the state - we want to save that
		const selectedChatTab = state.chatTabs.find(tab => tab.id === state.selectedChatTabId);
		selectedChatTab.name = newName;
		saveState();

		// Close chat tab config
		document.querySelector('.js-chat-tab-config').style.display = 'none';
	});

	// Create the initial chat tabs HTML
	const $chat = document.querySelector('#chat');
	const $chatTabs = makeElement({
		element: 'div',
		class: 'uimod-chat-tabs js-chat-tabs',
		content: '<div class="js-chat-tab-add">+</div>',
	});

	// Add them to the DOM
	$chat.parentNode.insertBefore($chatTabs, $chat);

	// Add all our chat tabs from state
	state.chatTabs.forEach(chatTab => {
		const isInittingTab = true;
		helpers.addChatTab(chatTab, isInittingTab);
	});

	// Wire up the add chat tab button
	document.querySelector('.js-chat-tab-add').addEventListener('click', clickEvent => {
		const chatTabId = helpers.addChatTab();
		const mousePos = { x: clickEvent.pageX, y: clickEvent.pageY };
		helpers.showChatTabConfigWindow(chatTabId, mousePos);
	});

	// If initial chat tab doesn't exist, create it based off current filter settings
	if (!Object.keys(state.chatTabs).length) {
		const tabId = uuid();
		const chatTab = {
			name: 'Main',
			id: tabId,
			filters: helpers.getCurrentChatFilters(),
		};
		state.chatTabs.push(chatTab);
		saveState();
		helpers.addChatTab(chatTab);
	}

	// Wire up click event handlers onto the filters to update the selected chat tab's filters in state
	document.querySelector('.channelselect').addEventListener('click', clickEvent => {
		const $elementMouseIsOver = document.elementFromPoint(
			clickEvent.clientX,
			clickEvent.clientY,
		);

		// We only want to change the filters if the user manually clicks the filter button
		// If they clicked a chat tab and we programatically set filters, we don't want to update
		// the current tab's filter state
		if (!$elementMouseIsOver.classList.contains('btn')) {
			return;
		}
		const selectedChatTab = state.chatTabs.find(tab => tab.id === state.selectedChatTabId);
		selectedChatTab.filters = helpers.getCurrentChatFilters();
		saveState();
	});

	// Select the currently selected tab in state on mod initialization
	if (state.selectedChatTabId) {
		helpers.selectChatTab(state.selectedChatTabId);
	}
}

export default {
	name: 'Chat tabs',
	description: 'Enables support for multiple chat tabs',
	run: customChatTabs,
};
