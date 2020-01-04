import { getWindow } from '../../utils/game';
import { WindowNames } from '../../utils/ui';

function deposit() {
	const $stash = getWindow(WindowNames.stash);

	// Select normal deposit button
	$stash.querySelector('.slot .grey.gold:not(.js-deposit-all)').dispatchEvent(new Event('click'));

	const $currencyInput = $stash.querySelector('input.formatted');

	// Input some huge value they'll have less than
	$currencyInput.value = 999999999999999;
	$currencyInput.dispatchEvent(new Event('input'));

	setTimeout(function() {
		const $depositButton = $stash.querySelector('.btn.blue');
		if (!$depositButton.classList.contains('disabled')) {
			$depositButton.dispatchEvent(new Event('click'));
		}

		// Clear input
		$currencyInput.value = '';
		$currencyInput.dispatchEvent(new Event('input'));
	}, 0);
}

export { deposit };
