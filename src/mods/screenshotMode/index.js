import { toggleScreenshotMode } from './helper';

function screenshotMode() {
	window.addEventListener('keyup', toggleScreenshotMode);
}

export default {
	name: 'Screenshot Mode',
	description: 'Hookup F9 key to toggle game UI visibly for cleaner screenshots',
	run: screenshotMode,
};
