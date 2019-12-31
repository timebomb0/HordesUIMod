import { getWindow } from '../../utils/game';
import { makeElement, debounce } from '../../utils/misc';
import { handleMerchantFilterInputChange } from './helpers';

function addMerchantFilter() {
	const $merchant = getWindow('Merchant');
	if (!$merchant) {
		return;
	}

	$merchant.classList.add('js-merchant-initd');
	$merchant.classList.add('uidom-merchant-with-filters');

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

function refreshMerchantFilter() {
	const $merchant = document.querySelector('.js-merchant-initd');
	if (!$merchant) {
		return;
	}
	if (!$merchant.querySelector('.js-merchant-filter-input').value) {
		return;
	}

	// Refresh filters after loading items from merchant
	setTimeout(handleMerchantFilterInputChange, 250);
}

export default {
	name: 'Merchant filter',
	description:
		'Allows you to specify filters, or search text, for items displayed in the merchant',
	run: ({ registerOnDomChange, registerOnLeftClick }) => {
		addMerchantFilter();
		registerOnDomChange(addMerchantFilter);
		const debouncedRefreshMerchantFilter = debounce(refreshMerchantFilter, 250);
		registerOnLeftClick(debouncedRefreshMerchantFilter);
	},
};
