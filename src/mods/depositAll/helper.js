function deposit() {
	// Select normal deposit button
	document
		.querySelector('.slot .grey.gold:not(.js-deposit-all)')
		.dispatchEvent(new Event('click'));

	// Input some huge value they'll have less than
	document.querySelector('input.formatted').value = 999999999999999;
	document.querySelector('input.formatted').dispatchEvent(new Event('input'));

	setTimeout(function() {
		// Only try to deposit if the Deposit button isn't disabled after the input event, avoids chat errors for invalid amount
		if (!document.querySelector('.btn.blue.disabled')) {
			// Click Deposit
			document.querySelector('.btn.blue').dispatchEvent(new Event('click'));
		}

		// Clear input
		document.querySelector('input.formatted').value = '';
		document.querySelector('input.formatted').dispatchEvent(new Event('input'));
	}, 0);
}

export { deposit };
