import { getWindow } from '../../utils/game';
import { WindowNames } from '../../utils/ui';

function deposit() {
	const $stash = getWindow(WindowNames.stash);

	// Select normal deposit button
	$stash.querySelector('.slot .grey.gold:not(.js-deposit-all)').dispatchEvent(new Event('click'));

	// Input some huge value they'll have less than

	const $currencyInput = $stash.querySelector('input.formatted');

	$currencyInput.value = 999999999999999;
	$currencyInput.dispatchEvent(new Event('input'));

	setTimeout(function() {
		// Only try to deposit if the Deposit button isn't disabled after the input event, avoids chat errors for invalid amount
		if (!$stash.querySelector('.btn.blue.disabled')) {
			// Click Deposit
			$stash.querySelector('.btn.blue').dispatchEvent(new Event('click'));
		}

		// Clear input
		$currencyInput.value = '';
		$currencyInput.dispatchEvent(new Event('input'));
	}, 0);
}

export { deposit };
