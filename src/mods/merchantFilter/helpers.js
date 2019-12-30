import { getTooltipContent } from '../../utils/game';

function handleMerchantFilterInputChange(event) {
	const value = event.target.value;

	// If no filters, include single empty string, to make every item visible
	const filters = value.split(',').map(v => v.trim()) || [''];

	const $items = Array.from(document.querySelectorAll('.js-merchant-initd .items .slot'));
	$items.forEach($item => {
		const tooltipContentPromise = getTooltipContent($item);
		tooltipContentPromise.then(tooltipContent => {
			let matchesAnyFilter = false;
			filters.forEach(filter => {
				const matchesFilter = tooltipContent.textContent
					.toLowerCase()
					.includes(filter.toLowerCase());
				if (matchesFilter) {
					matchesAnyFilter = true;
				}
			});

			if (matchesAnyFilter) {
				$item.parentNode.style.display = 'grid';
			} else {
				$item.parentNode.style.display = 'none';
			}
		});
	});
}

export { handleMerchantFilterInputChange };
