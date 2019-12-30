import * as chat from '../../utils/chat';
import { VERSION } from '../../utils/version';

function modStart() {
	chat.addChatMessage(`Hordes UI Mod v${VERSION} is now running.`);
}

export default {
	name: '[REQUIRED] UI Mod Startup',
	description: 'Do not remove this! This displays a welcome message and includes misc styles.',
	run: modStart,
};
