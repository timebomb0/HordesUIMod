import modStart from './_modStart';
import blockedPlayerSettings from './blockedPlayerSettings';
import chatContextMenu from './chatContextMenu';
import chatFilters from './chatFilters';
import chatTabs from './chatTabs';
// TODO: Get /cssMods/styles.scss somehow, maybe create index.js with imported css file? Maybe separate default styles.scss outside of mods?
import draggableUI from './draggableUI';
import friendsList from './friendsList';
import mapControls from './mapControls';
import resizableChat from './resizableChat';
import resizableMap from './resizableMap';
import selectedWindowIsTop from './selectedWindowIsTop';
import xpMeter from './xpMeter';

// The array here dictates the order of which mods are executed, from top to bottom
export default [
	modStart,
	resizableMap,
	mapControls,
	friendsList,
	blockedPlayerSettings,
	resizableChat,
	chatFilters,
	chatContextMenu,
	chatTabs,
	draggableUI,
	selectedWindowIsTop,
	xpMeter,
];
