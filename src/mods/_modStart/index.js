import * as chat from '../../utils/chat';
import { VERSION } from '../../utils/version';
import { loadState } from '../../utils/state';

function modStart() {
	chat.addChatMessage(`Hordes UI Mod v${VERSION} is now running.`);
	loadState();
}

export default {
	name: '[REQUIRED] UI Mod Startup',
	description:
		'Do not remove this! This displays a welcome message, loads saved state, and includes misc styles.',
	run: modStart,
};
