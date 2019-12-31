import { getWindow } from '../../utils/game';
import { makeElement, debounce } from '../../utils/misc';
import { isWindowOpen, setWindowOpen, setWindowClosed } from '../../utils/ui';
import { handleMerchantFilterInputChange, deleteMerchantObserver } from './helpers';

function addMerchantFilter() {
	const $merchant = getWindow('Merchant');
	if (!$merchant) {
		return;
	}

	$merchant.classList.add('js-merchant-initd');
	$merchant.classList.add('uidom-merchant-with-filters');
	setWindowOpen('merchant');

	const $lvMaximumField = $merchant.querySelectorAll('input[type="number"]')[1];

	const $customSearchField = makeElement({
		element: 'input',
		class: 'js-merchant-filter-input uidom-merchant-input',
		type: 'search',
		placeholder: 'Filters (comma separated)',
	});
	$lvMaximumField.parentNode.insertBefore($customSearchField, $lvMaximumField.nextSibling);

	$merchant
		.querySelector('.js-merchant-filter-input')
		.addEventListener('keyup', debounce(handleMerchantFilterInputChange, 250));
}

function cleanupMerchantObserver() {
	if (isWindowOpen('merchant')) {
		const $merchant = document.querySelector('.js-merchant-initd');
		if ($merchant) return;
	}

	// Window was set to open but is actually closed, let's clean up...
	setWindowClosed('merchant');
	deleteMerchantObserver();
}

export default {
	name: 'Merchant filter',
	description:
		'Allows you to specify filters, or search text, for items displayed in the merchant',
	run: ({ registerOnDomChange }) => {
		addMerchantFilter();
		registerOnDomChange(addMerchantFilter);
		registerOnDomChange(() => {
			cleanupMerchantObserver();
		});
	},
};
