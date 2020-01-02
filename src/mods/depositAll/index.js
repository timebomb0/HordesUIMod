import { makeElement } from '../../utils/misc';
import { getWindow } from '../../utils/game';
import { deposit } from './helper';

function addDepositAllButton() {
	const $stash = getWindow('Stash');
	// If stash is closed or deposit all button is already added, we dont need to do anything
	if (!$stash || $stash.querySelector('.js-deposit-all')) {
		return;
	}

	// Create deposit all button and add it to stash
	const depositTargetBtn = document.querySelector('.slot .grey.gold');
	const depositAllBtn = depositTargetBtn.cloneNode(true);
	const depositAllText = makeElement({
		element: 'span',
		content: ' ALL',
	});

	depositAllBtn.append(depositAllText);
	depositAllBtn.classList.add('js-deposit-all');
	depositAllBtn.classList.remove('active');

	depositTargetBtn.parentElement.insertBefore(depositAllBtn, depositTargetBtn);
	document.querySelector('.js-deposit-all').addEventListener('click', deposit);
}

export default {
	name: 'Desposit All Button',
	description: 'Adds a button to your stash to quickly deposit all of your money',
	run: ({ registerOnDomChange }) => {
		addDepositAllButton();
		registerOnDomChange(addDepositAllButton);
	},
};
