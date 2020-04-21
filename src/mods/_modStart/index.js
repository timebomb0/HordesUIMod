import * as chat from '../../utils/chat';
import { VERSION } from '../../utils/version';
import { testSaveState } from '../../utils/state';

function modStart() {
	chat.addChatMessage(`Hordes UI Mod v${VERSION} is now running.`);
	setInterval(() => {
		testSaveState();
	}, 2000);
}

export default {
	name: '[REQUIRED] UI Mod Startup',
	description: 'Do not remove this! This displays a welcome message and includes misc styles.',
	run: modStart,
	required: true,
};
