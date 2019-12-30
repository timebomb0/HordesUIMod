import { BREAKING_VERSION } from './version';
const STORAGE_STATE_KEY = 'hordesio-uimodsakaiyo-state';

let state = {
	breakingVersion: BREAKING_VERSION,
	chat: {
		GM: true,
	},
	windowsPos: {},
	blockList: {},
	friendsList: {},
	mapOpacity: 70, // e.g. 70 = opacity: 0.7
	friendNotes: {},
	chatTabs: [],
	xpMeterState: {
		currentXp: 0,
		xpGains: [], // array of xp deltas every second
		averageXp: 0,
		gainedXp: 0,
		currentLvl: 0,
	},
};

// tempState is saved only between page refreshes.
const tempState = {
	// The last name clicked in chat
	chatName: null,
	lastMapWidth: 0,
	lastMapHeight: 0,
	xpMeterInterval: null, // tracks the interval for fetching xp data
};

// Note: Calling this before initStateWithProxy will retrieve the old, wrong state.
// We proxy `state when loading, replacing `state` in this file.
function getState() {
	return state;
}

function getTempState() {
	return tempState;
}

function saveState() {
	localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
}

function loadState() {
	const storedStateJson = localStorage.getItem(STORAGE_STATE_KEY);
	if (storedStateJson) {
		const storedState = JSON.parse(storedStateJson);
		if (storedState.breakingVersion !== BREAKING_VERSION) {
			localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
			return;
		}
		for (let [key, value] of Object.entries(storedState)) {
			state[key] = value;
		}
	}
}

// Should be called once per initialize. Loads state and proxies it and every object in it with the passed proxy.
function initStateWithProxy(proxyHandler) {
	state = new Proxy(state, proxyHandler);
	loadState();
}

export { getState, getTempState, saveState, loadState, initStateWithProxy };
