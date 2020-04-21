import { toggleScreenshotMode } from './helper';

function screenshotMode() {
	window.addEventListener('keyup', toggleScreenshotMode);
}

export default {
	name: 'Screenshot Mode',
	description: 'F9 key toggles game UI visibly for cleaner screenshots',
	run: screenshotMode,
};
