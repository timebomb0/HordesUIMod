import mods from './mods';
import { initStateWithProxy, getState } from './utils/state';
import { deepClone } from './utils/misc';

// Add new DOM, load our stored state, wire it up, then continuously rerun specific methods whenever UI changes
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
		onPageClick: [],

		// Whenever the state object changes
		onStateChange: [],
	};

	// Initialize state, deeply proxying it so we can hook into it, and then loading it from localStorage
	const stateProxyHandler = {
		// Deeply nest our proxy into every object/array in the state
		get: (target, key) => {
			if (typeof target[key] === 'object' && target[key] !== null) {
				return new Proxy(target[key], stateProxyHandler);
			} else {
				return target[key];
			}
		},

		set: (target, key, value) => {
			// Deeply clone state before updating it, to act as previous state
			// We clone `getState` instead of `target` because target might be a nested proxy, but we want to pass the full state
			const prevState = deepClone(getState());
			// Update state
			target[key] = value;
			// Trigger onStateChange
			rerunning.onStateChange.forEach(callback => callback(prevState, getState()));

			return true;
		},
	};
	initStateWithProxy(stateProxyHandler);

	// Run all our mods
	const registerOnDomChange = callback => rerunning.onDomChange.push(callback);
	const registerOnChatChange = callback => rerunning.onChatChange.push(callback);
	const registerOnPageClick = callback => rerunning.onPageClick.push(callback);
	const registerOnStateChange = callback => rerunning.onStateChange.push(callback);
	mods.forEach(mod => {
		mod.run({
			registerOnDomChange,
			registerOnChatChange,
			registerOnPageClick,
			registerOnStateChange,
		});
	});

	// Continuously re-run specific mods methods that need to be executed on UI change
	const rerunObserver = new MutationObserver(() => {
		// If new window appears, e.g. even if window is closed and reopened, we need to rewire it
		// Fun fact: Some windows always exist in the DOM, even when hidden, e.g. Inventory
		// 		     But some windows only exist in the DOM when open, e.g. Interaction
		rerunning.onDomChange.forEach(callback => callback());
	});
	rerunObserver.observe(document.querySelector('.layout > .container'), {
		attributes: false,
		childList: true,
	});

	// Rerun only on chat messages changing
	const chatRerunObserver = new MutationObserver(() => {
		rerunning.onChatChange.forEach(callback => callback());
	});
	chatRerunObserver.observe(document.querySelector('#chat'), {
		attributes: false,
		childList: true,
	});

	// Event listeners for document.body might be kept when the game reloads, so don't reinitialize them
	if (!document.body.classList.contains('js-uimod-initd')) {
		document.body.classList.add('js-uimod-initd');

		rerunning.onPageClick.forEach(callback =>
			document.body.addEventListener('click', callback),
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
