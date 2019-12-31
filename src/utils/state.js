import { BREAKING_VERSION } from './version';
import { deepClone } from './misc';
const STORAGE_STATE_KEY = 'hordesio-uimodsakaiyo-state';

const stateTemplate = {
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
	openWindows: {
		friendsList: false,
		blockList: false,
		xpMeter: false,
		merchant: false,
	},
};

let state = deepClone(stateTemplate);

// tempState is saved only between page refreshes.
const tempState = {
	// The last name clicked in chat
	chatName: null,
	lastMapWidth: 0,
	lastMapHeight: 0,
	xpMeterInterval: null, // tracks the interval for fetching xp data
	keyModifiers: {
		shift: false,
		control: false,
		alt: false,
	}, // set by _keyModifiers mod
};

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
		cleanState();
	}
}

// Remove keys when they're meant to be strictly tracked
function cleanState() {
	// Currently only cleaning openWindows
	Object.keys(state.openWindows).forEach(window => {
		if (stateTemplate.openWindows[window] == undefined) {
			delete state.openWindows[window];
		}
	});
}

export { getState, getTempState, saveState, loadState };
