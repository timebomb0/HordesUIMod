import { makeElement } from '../../utils/misc';

function createScreenshotWarning() {
	// If it already exists kill it so we can remake it with a fresh fadeout
	if (document.querySelector('js-screenshot-warning')) {
		removeScreenshotWarning();
	}

	const $screenshotWarningContainer = makeElement({
		element: 'span',
		class: 'js-screenshot-warning uimod-screenshot-warning-container',
	});

	const $screenshotWarning = makeElement({
		element: 'span',
		class: 'uimod-screenshot-warning',
		content: 'Press F9 to exit screenshot mode',
	});

	$screenshotWarningContainer.appendChild($screenshotWarning);

	document.body.appendChild($screenshotWarningContainer);

	setTimeout(() => {
		$screenshotWarningContainer.classList.add('uimod-screenshot-warning-fadeout');
	}, 3000);
}

function removeScreenshotWarning() {
	const $screenshotWarning = document.querySelector('.js-screenshot-warning');

	// If it's already removed for some reason don't bother trying to remove it
	if (!$screenshotWarning) {
		return;
	}

	$screenshotWarning.parentNode.removeChild($screenshotWarning);
}

export { createScreenshotWarning, removeScreenshotWarning };
