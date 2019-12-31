import { getTooltipContent } from '../../utils/game';
import { getTempState } from '../../utils/state';

function handleMerchantFilterInputChange() {
	const $filterInput = document.querySelector('.js-merchant-filter-input');
	if (!$filterInput) {
		return;
	}

	const value = $filterInput.value;
	if (value) {
		_refreshMerchantFilter(); // When we're filtering, start refreshing merchant filter if we haven't already
	}

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

function _refreshMerchantFilter() {
	const tempState = getTempState();

	// If we're already observing, we don't need to observe again
	if (tempState.merchantLoadingObserver) return;

	tempState.merchantLoadingObserver = new MutationObserver(mutation => {
		// If spinner is visible, we are loading. Once spinner is not visible, we are no longer loading
		if (
			mutation[0] &&
			mutation[0].addedNodes[0] &&
			mutation[0].addedNodes[0].classList.contains('spinner')
		) {
			tempState.merchantLoading = true;
		} else {
			// If we were loading and now we aren't, we want to refresh the filters
			if (tempState.merchantLoading) {
				handleMerchantFilterInputChange();
			}
			tempState.merchantLoading = false;
		}
	});
	tempState.merchantLoadingObserver.observe(document.querySelector('.js-merchant-initd .buy'), {
		attributes: false,
		childList: true,
		subtree: true,
	});
}

function deleteMerchantObserver() {
	const tempState = getTempState();

	if (tempState.merchantLoadingObserver) {
		tempState.merchantLoading = false;
		tempState.merchantLoadingObserver.disconnect();
		delete tempState.merchantLoadingObserver;
	}
}

export { handleMerchantFilterInputChange, deleteMerchantObserver };
