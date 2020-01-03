import modStart from './_modStart';
import customSettings from './customSettings';
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

// The array here dictates the order of which mods are executed, from top to bottom
export default [
	modStart,
	keyPressTracker,
	resizableMap,
	mapControls,
	friendsList,
	customSettings,
	resizableChat,
	chatFilters,
	chatContextMenu,
	chatTabs,
	draggableUI,
	selectedWindowIsTop,
	xpMeter,
	merchantFilter,
	itemStatsCopy,
	clanActivityTracker,
];
