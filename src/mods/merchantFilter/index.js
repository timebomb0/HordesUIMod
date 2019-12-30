import { getWindow } from '../../utils/game';
import { makeElement, debounce } from '../../utils/misc';
import { handleMerchantFilterInputChange } from './helpers';

function addMerchantFilter() {
	const $merchant = getWindow('Merchant');
	if (!$merchant || $merchant.classList.contains('js-merchant-initd')) {
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

export default {
	name: 'Merchant filter',
	description:
		'Allows you to specify filters, or search text, for items displayed in the merchant',
	run: ({ registerOnDomChange }) => {
		addMerchantFilter();
		registerOnDomChange(addMerchantFilter);
	},
};
