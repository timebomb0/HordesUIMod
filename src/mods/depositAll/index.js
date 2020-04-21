import { makeElement } from '../../utils/misc';
import { WindowNames } from '../../utils/ui';
import { getWindow } from '../../utils/game';
import { deposit, withdraw } from './helper';

function addDepositAllButton() {
	const $stash = getWindow(WindowNames.stash);
	// If stash is closed or deposit all button is already added, we dont need to do anything
	if (!$stash || $stash.querySelector('.js-deposit-all')) {
		return;
	}

	// Create deposit all button and add it to stash
	const $depositTargetBtn = $stash.querySelector('.slot .grey.gold');
	const $depositAllBtn = $depositTargetBtn.cloneNode(true);
	const $depositAllText = makeElement({
		element: 'span',
		content: ' ALL',
	});

	$depositAllBtn.append($depositAllText);
	$depositAllBtn.classList.add('js-deposit-all');
	$depositAllBtn.classList.remove('active');

	$depositTargetBtn.parentElement.insertBefore($depositAllBtn, $depositTargetBtn);
	$stash.querySelector('.js-deposit-all').addEventListener('click', deposit);
}

function addWithdrawAllButton() {
	const $stash = getWindow(WindowNames.stash);
	// If stash is closed or withdraw all button is already added, we dont need to do anything
	if (!$stash || $stash.querySelector('.js-withdraw-all')) {
		return;
	}

	// Create withdraw all button and add it to stash
	const $stashBtns = $stash.querySelectorAll('.slot .grey.gold');
	const $withdrawTargetBtn = $stashBtns[$stashBtns.length - 1]; // Right most button
	const $withdrawAllBtn = $withdrawTargetBtn.cloneNode(true);
	const $withdrawAllText = makeElement({
		element: 'span',
		content: ' ALL',
	});

	$withdrawAllBtn.append($withdrawAllText);
	$withdrawAllBtn.classList.add('js-withdraw-all');
	$withdrawAllBtn.classList.remove('active');

	$withdrawTargetBtn.parentElement.insertBefore($withdrawAllBtn, $withdrawTargetBtn);
	$stash.querySelector('.js-withdraw-all').addEventListener('click', withdraw);
}

export default {
	name: 'Desposit/Withdraw All Button',
	description: 'Adds two buttons to your stash to quickly deposit/withdraw all of your money',
	run: ({ registerOnDomChange }) => {
		addDepositAllButton();
		registerOnDomChange(addDepositAllButton);

		addWithdrawAllButton();
		registerOnDomChange(addWithdrawAllButton);
	},
};
