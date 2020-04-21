import modStart from './_modStart';
import customSettings from './_customSettings';
import chatContextMenu from './chatContextMenu';
import chatFilters from './chatFilters';
import chatTabs from './chatTabs';
import draggableUI from './draggableUI';
import friendsList from './friendsList';
import mapControls from './mapControls';
import resizableChat from './resizableChat';
import resizableMap from './resizableMap';
import selectedWindowIsTop from './selectedWindowIsTop';
import xpMeter from './xpMeter';
import merchantFilter from './merchantFilter';
import itemStatsCopy from './itemStatsCopy';
import keyPressTracker from './_keyPressTracker';
import clanActivityTracker from './clanActivityTracker';
import skillCooldownNumbers from './skillCooldownNumbers';
import depositAll from './depositAll';
import lockedItemSlots from './lockedItemSlots';
import screenshotMode from './screenshotMode';
import buffTooltips from './buffTooltips';
import healthColorChanger from './healthColorChanger';
import blockList from './blockList';

// The array here dictates the order of which mods are executed, from top to bottom
export default [
	// MUST BE AT THE TOP:
	modStart,
	keyPressTracker,

	// Order for these items only matter in regards to registering items in settings/chat menu:
	friendsList,
	blockList,

	// Order for these items shouldn't matter:
	resizableMap,
	mapControls,
	resizableChat,
	chatFilters,
	chatTabs,
	draggableUI,
	selectedWindowIsTop,
	xpMeter,
	merchantFilter,
	itemStatsCopy,
	clanActivityTracker,
	skillCooldownNumbers,
	depositAll,
	lockedItemSlots,
	screenshotMode,
	buffTooltips,
	healthColorChanger,

	// MUST BE AT THE BOTTOM:
	customSettings,
	chatContextMenu,
];
