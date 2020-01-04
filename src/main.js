import mods from './mods';

function initialize() {
	// If the Hordes.io tab isn't active for long enough, it reloads the entire page, clearing this mod
	// We check for that and reinitialize the mod if that happens
	const $layout = document.querySelector('.layout');
	if ($layout.classList.contains('uimod-initd')) {
		return;
	}
	$layout.classList.add('uimod-initd');

	const rerunning = {
		// MutationObserver running whenever .layout changes
		onDomChange: [],

		// Mutation observer running whenever #chat changes
		onChatChange: [],

		// `click` Event listener running on document.body
		onLeftClick: [],

		// `contextmenu` Event listener running on document.body
		onRightClick: [],
	};

	// Run all our mods
	const registerOnDomChange = callback => rerunning.onDomChange.push(callback);
	const registerOnChatChange = callback => rerunning.onChatChange.push(callback);
	const registerOnLeftClick = callback => rerunning.onLeftClick.push(callback);
	const registerOnRightClick = callback => rerunning.onRightClick.push(callback);
	mods.forEach(mod => {
		mod.run({
			registerOnDomChange,
			registerOnChatChange,
			registerOnLeftClick,
			registerOnRightClick,
		});
	});

	// Continuously re-run specific mods methods that need to be executed on UI change
	const rerunObserver = new MutationObserver(mutations => {
		// If new window appears, e.g. even if window is closed and reopened, we need to rewire it
		// Fun fact: Some windows always exist in the DOM, even when hidden, e.g. Inventory
		// 		     But some windows only exist in the DOM when open, e.g. Interaction
		rerunning.onDomChange.forEach(callback => callback(mutations));
	});
	Array.from(
		document.querySelectorAll(
			'.layout > .container, .actionbarcontainer, .partyframes, .targetframes',
		),
	).forEach($container => {
		rerunObserver.observe($container, {
			attributes: false,
			childList: true,
		});
	});

	// Rerun only on chat messages changing
	const chatRerunObserver = new MutationObserver(mutations => {
		rerunning.onChatChange.forEach(callback => callback(mutations));
	});
	chatRerunObserver.observe(document.querySelector('#chat'), {
		attributes: false,
		childList: true,
	});

	// Event listeners for document.body might be kept when the game reloads, so don't reinitialize them
	if (!document.body.classList.contains('js-uimod-initd')) {
		document.body.classList.add('js-uimod-initd');

		rerunning.onLeftClick.forEach(callback =>
			document.body.addEventListener('click', callback),
		);
		rerunning.onRightClick.forEach(callback =>
			document.body.addEventListener('contextmenu', callback),
		);
	}
}

// Initialize mods once UI DOM has loaded
// Rerunning updates on every call to initialize
const pageObserver = new MutationObserver(() => {
	const isUiLoaded = !!document.querySelector('.layout');
	if (isUiLoaded) {
		initialize();
	}
});
pageObserver.observe(document.body, { attributes: true, childList: true });
