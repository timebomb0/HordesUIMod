import { createBlockList, removeBlockList } from './blockListUi';
import { registerSettingsMenuItem } from '../_customSettings';
import { WindowNames } from '../../utils/ui';
import { registerChatMenuItem } from '../chatContextMenu';
import { blockPlayer } from '../../utils/player';
import { getTempState } from '../../utils/state';

function blockList() {
	const tempState = getTempState();

	WindowNames.blockList = 'block-list';

	registerSettingsMenuItem({
		windowName: WindowNames.blockList,
		handleOpenWindow: createBlockList,
		label: 'Blocked players',
	});

	registerChatMenuItem({
		id: 'block',
		label: 'Block',
		handleClick: () => {
			blockPlayer(tempState.chatName);
		},
	});
}

export default {
	name: 'Block list',
	description:
		'Allows you to block players by clicking their names in chat. View/unblock players in Settings -> Blocked players',
	run: blockList,
};

export { createBlockList, removeBlockList };
