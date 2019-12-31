import { getTooltipContent } from '../../utils/game';

function handleMerchantFilterInputChange() {
	const value = document.querySelector('.js-merchant-filter-input').value;

	// If no filters, include single empty string, to make every item visible
	const filters = value.split(',').map(v => v.trim()) || [''];

	const $items = Array.from(document.querySelectorAll('.js-merchant-initd .items .slot'));
	$items.forEach($item => {
		const tooltipContentPromise = getTooltipContent($item);
		tooltipContentPromise.then(tooltipContent => {
			if (!tooltipContent) {
				// Something weird happened, probably related to lag from looking at tooltips in bulk
				// In this case where we unexpectedly don't have the tooltip, just show the item rather than error out
				$item.parentNode.style.display = 'grid';
				return;
			}

			let filterMatchCount = 0;
			filters.forEach(filter => {
				const matchesFilter = tooltipContent.textContent
					.toLowerCase()
					.includes(filter.toLowerCase());
				if (matchesFilter) {
					filterMatchCount++;
				}
			});

			const matchesAllFilters = filterMatchCount === filters.length;
			if (matchesAllFilters) {
				$item.parentNode.style.display = 'grid';
			} else {
				$item.parentNode.style.display = 'none';
			}
		});
	});
}

export { handleMerchantFilterInputChange };
