import * as chat from '../../utils/chat';
import { getState, saveState } from '../../utils/state';
import { makeElement, uuid } from '../../utils/misc';

const DEFAULT_CHAT_TAB_NAME = 'Untitled';

// Gets current chat filters as represented in the UI
// filter being true means it's invisible(filtered) in chat
// filter being false means it's visible(unfiltered) in chat
function getCurrentChatFilters() {
	const state = getState();

	// Saved by the official game client
	const gameFilters = JSON.parse(localStorage.getItem('filteredChannels'));
	return {
		global: gameFilters.includes('global'),
		faction: gameFilters.includes('faction'),
		party: gameFilters.includes('party'),
		clan: gameFilters.includes('clan'),
		pvp: gameFilters.includes('pvp'),
		inv: gameFilters.includes('inv'),
		GM: !state.chat.GM, // state.chat.GM is whether or not GM chat is shown - we want whether or not GM chat should be hidden
	};
}

// Shows the chat tab config window for a specific tab, displayed in a specific position
function showChatTabConfigWindow(tabId, pos) {
	const state = getState();
	const tempState = getTempState();

	const $chatTabConfig = document.querySelector('.js-chat-tab-config');
	const chatTab = state.chatTabs.find(tab => tab.id === tabId);
	// Update position and name in chat tab config
	$chatTabConfig.style.left = `${pos.x}px`;
	$chatTabConfig.style.top = `${pos.y}px`;
	$chatTabConfig.querySelector('.js-chat-tab-name').value = chatTab.name;

	// Store tabId in state, to be used by the Remove/Add buttons in config window
	tempState.editedChatTabId = tabId;

	// Hide remove button if only one chat tab left - can't remove last one
	// Show it if more than one chat tab left
	const chatTabCount = Object.keys(state.chatTabs).length;
	const $removeChatTabBtn = $chatTabConfig.querySelector('.js-remove-chat-tab');
	$removeChatTabBtn.style.display = chatTabCount < 2 ? 'none' : 'block';

	// Show chat tab config
	$chatTabConfig.style.display = 'block';
}

// Adds chat tab to DOM, sets it as selected
// If argument chatTab is provided, will use that name+id
// If no argument is provided, will create new tab name/id and add it to state
// isInittingTab is optional boolean, if `true`, will _not_ set added tab as selected. Used when initializing all chat tabs on load
// Returns newly added tabId
function addChatTab(chatTab, isInittingTab) {
	const state = getState();

	let tabName = DEFAULT_CHAT_TAB_NAME;
	let tabId = uuid();
	if (chatTab) {
		tabName = chatTab.name;
		tabId = chatTab.id;
	} else {
		// If no chat tab was provided, create it in state
		state.chatTabs.push({
			name: tabName,
			id: tabId,
			filters: getCurrentChatFilters(),
		});
		saveState();
	}

	const $tabs = document.querySelector('.js-chat-tabs');
	const $tab = makeElement({
		element: 'div',
		content: tabName,
	});
	$tab.setAttribute('data-tab-id', tabId);

	// Add chat tab to DOM
	$tabs.appendChild($tab);

	// Wire chat tab up to open config on right click
	$tab.addEventListener('contextmenu', clickEvent => {
		const mousePos = { x: clickEvent.pageX, y: clickEvent.pageY };
		showChatTabConfigWindow(tabId, mousePos);
	});
	// And select chat tab on left click
	$tab.addEventListener('click', () => {
		selectChatTab(tabId);
	});

	if (!isInittingTab) {
		// Select the newly added chat tab
		selectChatTab(tabId);
	}

	// Returning tabId to all adding new tab to pass tab ID to `showChatTabConfigWindow`
	return tabId;
}

// Selects chat tab [on click], updating client chat filters and custom chat filters
function selectChatTab(tabId) {
	const state = getState();

	// Remove selected class from everything, then add selected class to clicked tab
	Array.from(document.querySelectorAll('[data-tab-id]')).forEach($tab => {
		$tab.classList.remove('js-selected-tab');
	});
	const $tab = document.querySelector(`[data-tab-id="${tabId}"]`);
	$tab.classList.add('js-selected-tab');

	const tabFilters = state.chatTabs.find(tab => tab.id === tabId).filters;
	// Simulating clicks on the filters to turn them on/off
	const $filterButtons = Array.from(document.querySelectorAll('.channelselect small'));
	Object.keys(tabFilters).forEach(filter => {
		const $filterButton = $filterButtons.find($btn => $btn.textContent === filter);
		const isCurrentlyFiltered = $filterButton.classList.contains('textgrey');

		// If is currently filtered but filter for this tab is turned off, click it to turn filter off
		if (isCurrentlyFiltered && !tabFilters[filter]) {
			$filterButton.click();
		}
		// If it is not currently filtered but filter for this tab is turned on, click it to turn filter on
		if (!isCurrentlyFiltered && tabFilters[filter]) {
			$filterButton.click();
		}
	});

	// Update state for our custom chat filters to match the tab's configuration, then filter chat for it
	const isGMChatVisible = !tabFilters.GM;
	chat.setGMChatVisibility(isGMChatVisible);

	// Update the selected tab in state
	state.selectedChatTabId = tabId;
	saveState();
}

export { showChatTabConfigWindow, addChatTab, selectChatTab, getCurrentChatFilters };
