import { isWindowOpen, WindowNames, setWindowClosed, setWindowOpen } from '../../utils/ui';
import { getTempState, getState, saveState } from '../../utils/state';
import { handleClanWindowChange } from './helpers';

// When clan window is open, initialize the mutation observer to add Last seen and track last seen in state
function clanActivityTracker() {
	const tempState = getTempState();

	const $clanWindow = document.querySelector('.window .clanView');
	// If the window is no longer visible, update the state to denote the window has closed and kill the observer
	if (!$clanWindow) {
		if (isWindowOpen(WindowNames.clan)) {
			if (tempState.clanWindowObserver) {
				tempState.clanWindowObserver.disconnect();
				delete tempState.clanWindowObserver;
			}
			if (tempState.clanTableObserver) {
				tempState.clanTableObserver.disconnect();
				delete tempState.clanTableObserver;
			}
			setWindowClosed(WindowNames.clan);
		}
	} else if (!tempState.clanWindowObserver) {
		setWindowOpen(WindowNames.clan);
		handleClanWindowChange();
		tempState.clanWindowObserver = new MutationObserver(handleClanWindowChange);
		tempState.clanWindowObserver.observe($clanWindow, {
			attributes: true,
			childList: true,
		});
	}
}

// Update last seen for clan members when they type in chat
function refreshLastSeenClanMember(mutations) {
	const state = getState();

	let updatedState = false;
	const $newChatLines = mutations.map(mutation => Array.from(mutation.addedNodes)).flat();
	$newChatLines.forEach($chatLine => {
		const $name = $chatLine.querySelector('.name');
		if (!$name) return;

		const name = $name.textContent.trim();
		// If not clan member, don't update state
		if (!state.clanLastActiveMembers.hasOwnProperty(name)) return;

		updatedState = true;
		state.clanLastActiveMembers[name] = Date.now();
	});

	if (updatedState) saveState();
}

export default {
	name: 'Clan activity tracker',
	description: 'Updates clan member table with a Last seen column',
	run: ({ registerOnDomChange, registerOnChatChange }) => {
		clanActivityTracker(); // Run it initially once in case clan is already open on mod load
		registerOnDomChange(clanActivityTracker); // Run it on dom change for whenever the clan window is opened/closed
		registerOnChatChange(refreshLastSeenClanMember); // Run it on chat change so whenever a clan member chats, their last seen is updated
	},
};
