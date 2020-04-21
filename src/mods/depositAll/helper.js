import { getWindow } from '../../utils/game';
import { WindowNames } from '../../utils/ui';

function _executeStashAction($stash) {
	const $currencyInput = $stash.querySelector('input.formatted');

	// Input some huge value they'll have less than
	$currencyInput.value = 999999999999999;
	$currencyInput.dispatchEvent(new Event('input'));

	setTimeout(function() {
		const $actionButton = $stash.querySelector('.marg-top .btn');
		if (!$actionButton.classList.contains('disabled')) {
			$actionButton.dispatchEvent(new Event('click'));
		}

		// Clear input
		$currencyInput.value = '';
		$currencyInput.dispatchEvent(new Event('input'));
	}, 0);
}

function deposit() {
	const $stash = getWindow(WindowNames.stash);

	// Select normal deposit button
	$stash.querySelector('.slot .grey.gold:not(.js-deposit-all)').dispatchEvent(new Event('click'));

	_executeStashAction($stash);
}

function withdraw() {
	const $stash = getWindow(WindowNames.stash);

	// Select normal deposit button
	const $stashBtns = $stash.querySelectorAll('.slot .grey.gold:not(.js-withdraw-all');
	const $withdrawBtn = $stashBtns[$stashBtns.length - 1]; // Right most button
	$withdrawBtn.dispatchEvent(new Event('click'));

	_executeStashAction($stash);
}

export { deposit, withdraw };
