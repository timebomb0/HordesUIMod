import { getState, saveState } from './state';
import { makeElement } from './misc';

// Updates state.chat.GM and the DOM to make text white/grey depending on if gm chat is visible/filtered
// Then filters chat and saves updated chat state
function setGMChatVisibility(isGMChatVisible) {
	const state = getState();

	const $chatGM = document.querySelector(`.js-chat-gm`);
	state.chat.GM = isGMChatVisible;
	$chatGM.classList.toggle('textgrey', !state.chat.GM);
	filterAllChat();
	saveState();
}

// Filters all chat based on custom filters
function filterAllChat() {
	const state = getState();

	// Blocked user filter
	Object.keys(state.blockList).forEach(blockedName => {
		// Get the `.name` elements from the blocked user, if we haven't already hidden their messages
		const $blockedChatNames = Array.from(
			document.querySelectorAll(`[data-chat-name="${blockedName}"]:not(.js-line-blocked)`),
		);

		// Hide each of their messages
		$blockedChatNames.forEach($name => {
			// Add the class name to $name so we can track whether it's been hidden in our CSS selector $blockedChatNames
			$name.classList.add('js-line-blocked');
			const $line = $name.parentNode.parentNode.parentNode;
			// Add the class name to $line so we can visibly hide the entire chat line
			$line.classList.add('js-line-blocked');
		});
	});

	// Custom channel filter
	Object.keys(state.chat).forEach(channel => {
		Array.from(document.querySelectorAll(`.text${channel}.content`)).forEach($textItem => {
			const $line = $textItem.parentNode.parentNode;
			$line.classList.toggle('js-line-hidden', !state.chat[channel]);
		});
	});
}

function enterTextIntoChat(text) {
	// Open chat input
	const enterEvent = new KeyboardEvent('keydown', {
		bubbles: true,
		cancelable: true,
		keyCode: 13,
	});
	document.body.dispatchEvent(enterEvent);

	// Place text into chat
	const $input = document.querySelector('#chatinput input');
	$input.value = text;

	// Get chat input to recognize slash commands and change the channel
	// by triggering the `input` event.
	// (Did some debugging to figure out the channel only changes when the
	//  svelte `input` event listener exists.)
	const inputEvent = new KeyboardEvent('input', {
		bubbles: true,
		cancelable: true,
	});
	$input.dispatchEvent(inputEvent);
}
function submitChat() {
	const $input = document.querySelector('#chatinput input');
	const kbEvent = new KeyboardEvent('keydown', {
		bubbles: true,
		cancelable: true,
		keyCode: 13,
	});
	$input.dispatchEvent(kbEvent);
}

// Automated chat command helpers
// (We've been OK'd to do these by the dev - all automation like this should receive approval from the dev)
function whisperPlayer(playerName) {
	enterTextIntoChat(`/${playerName} `);
}
function partyPlayer(playerName) {
	enterTextIntoChat(`/partyinvite ${playerName}`);
	submitChat();
}

// Pushes message to chat
// TODO: The margins for the message are off slightly compared to other messages - why?
function addChatMessage(text) {
	const newMessageHTML = `
    <div class="linewrap svelte-1vrlsr3">
        <span class="time svelte-1vrlsr3">00.00</span>
        <span class="textuimod content svelte-1vrlsr3">
        <span class="capitalize channel svelte-1vrlsr3">UIMod</span>
        </span>
        <span class="svelte-1vrlsr3">${text}</span>
    </div>
    `;

	const element = makeElement({
		element: 'article',
		class: 'line svelte-1vrlsr3',
		content: newMessageHTML,
	});
	const $chat = document.querySelector('#chat');
	$chat.appendChild(element);

	// Scroll to bottom of chat
	$chat.scrollTop = $chat.scrollHeight;
}

export { setGMChatVisibility, filterAllChat, whisperPlayer, partyPlayer, addChatMessage };
