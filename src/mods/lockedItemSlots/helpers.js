import { triggerRightClickMenu } from '../../utils/game';
import { getState, getTempState, saveState } from '../../utils/state';
import { makeElement } from '../../utils/misc';

function _wireLockSlot($lockedSlot) {
	const state = getState();
	const tempState = getTempState();

	const slotNumber = $lockedSlot.getAttribute('data-locked-slot-num');
	const $bagSlot = document.querySelector(`#bag${slotNumber}`);

	$lockedSlot.addEventListener('click', () => {
		$bagSlot.dispatchEvent(new Event('pointerup'));
	});

	$lockedSlot.addEventListener('contextmenu', () => {
		// Block shift+right click
		if (tempState.keyModifiers.shift) return;
		// Don't do anything if no item in this slot
		if (!$bagSlot.querySelector('img')) return;

		// Emulate right click on the item to display its context menu
		triggerRightClickMenu($bagSlot);
		setTimeout(() => {
			const $contextMenuChoices = Array.from(
				document.querySelectorAll('.container > .panel.context .choice'),
			);
			// Remove "Drop item" from context menu
			$contextMenuChoices.forEach($choice => {
				if ($choice.textContent.toLowerCase() === 'drop item') {
					$choice.style.display = 'none';
				}
			});

			// Add "Unlock slot" menu item
			$contextMenuChoices[0].parentNode.appendChild(
				makeElement({
					element: 'div',
					class: 'choice js-unlock-item',
					content: 'Unlock slot',
				}),
			);

			// Wire up "Unlock slot" menu item
			const $unlockItemChoice = document.querySelector('.js-unlock-item');
			$unlockItemChoice.addEventListener('click', () => {
				state.lockedItemSlots.splice(state.lockedItemSlots.indexOf(slotNumber), 1);
				saveState();

				$lockedSlot.parentNode.removeChild($lockedSlot);

				// Hide context menu after clicking unlock (removing it breaks client that tries to remove it later)
				const $contextMenu = $unlockItemChoice.parentNode;
				$contextMenu.style.display = 'none';
			});
		}, 0);
	});
}

function lockSlot(slotNumber) {
	const $slot = document.querySelector(`#bag${slotNumber}`);
	if (!$slot) return;
	// If slot has already been locked, don't lock it again
	if (document.querySelector(`.js-locked-slot[data-locked-slot-num="${slotNumber}"]`)) return;

	const $lockedSlot = makeElement({
		element: 'div',
		class: 'js-locked-slot uimod-locked-slot',
	});
	$lockedSlot.setAttribute('data-locked-slot-num', slotNumber);
	$lockedSlot.setAttribute('style', `left: ${$slot.offsetLeft}px; top: ${$slot.offsetTop}px;`);
	$slot.parentNode.insertBefore($lockedSlot, $slot);

	_wireLockSlot($lockedSlot);
}

export { lockSlot };
