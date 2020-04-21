import { getWindow } from '../../utils/game';
import { makeElement, debounce } from '../../utils/misc';
import { isWindowOpen, setWindowOpen, setWindowClosed, WindowNames } from '../../utils/ui';
import { handleStashFilterInputChange, deleteStashObserver } from './helpers';

function addStashFilter() {
	const $stash = getWindow('Stash');
	if (!$stash || $stash.querySelector('.js-stash-search-input')) {
		return;
	}

	$stash.classList.add('js-stash-initd');
	$stash.classList.add('uidom-stash-with-searchs');
	setWindowOpen(WindowNames.stash);

	const $lvMaximumField = $stash.querySelectorAll('input[type="number"]')[1];

	const $customSearchField = makeElement({
		element: 'input',
		class: 'js-stash-search-input uidom-stash-input',
		type: 'search',
		placeholder: 'Search',
	});
	$lvMaximumField.parentNode.insertBefore($customSearchField, $lvMaximumField.nextSibling);

	$stash
		.querySelector('.js-stash-search-input')
		.addEventListener('keyup', debounce(handleStashFilterInputChange, 250));
}

function cleanupStashObserver() {
	if (isWindowOpen(WindowNames.stash)) {
		const $stash = document.querySelector('.js-stash-initd');
		if ($stash) return;
	}

	// Window was set to open but is actually closed, let's clean up...
	setWindowClosed(WindowNames.stash);
	deleteStashObserver();
}

export default {
	disabled: true,
	name: 'Stash search',
	description: 'Allows you to search for specific items in stash',
	run: ({ registerOnDomChange }) => {
		addStashFilter();
		registerOnDomChange(addStashFilter);
		registerOnDomChange(() => {
			cleanupStashObserver();
		});
	},
};
