import { WindowNames } from '../../utils/ui';
import { getWindow } from '../../utils/game';
import { getState, saveState } from '../../utils/state';
import { makeElement } from '../../utils/misc';
import { lockSlot } from './helpers';

function addLockItemContextMenu() {
	const state = getState();
	const $inventory = getWindow(WindowNames.inventory);
	const $inventoryContextMenu = document.querySelector(
		'.container > .panel.context:not(.js-lock-menu-initd)',
	);
	if (!$inventory || !$inventoryContextMenu) return;

	// Add Lock slot, only if unlock slot doesn't exist
	// Use `setTimeout` to wait for `unlock slot` to be added
	setTimeout(() => {
		// If Lock slot already added, dont add it
		if (document.querySelector('.js-lock-item')) return;

		// If Unlock slot exists, don't add Lock slot
		const isLocked = Array.from($inventoryContextMenu.querySelectorAll('.choice')).some(
			$choice => $choice.textContent.toLowerCase() === 'unlock slot',
		);
		if (isLocked) return;

		$inventoryContextMenu.appendChild(
			makeElement({
				element: 'div',
				class: 'choice js-lock-item',
				content: 'Lock slot',
			}),
		);

		document.querySelector('.js-lock-item').addEventListener('click', () => {
			// Get bag slot element displayed above right click menu
			// Overlay of the bag slot is selected by `elementFromPoint
			const $bagSlotOverlay = document.elementFromPoint(
				$inventoryContextMenu.offsetLeft,
				$inventoryContextMenu.offsetTop - 10,
			);
			// Parent of overlay is the bag slot. Get its id (e.g. "bag4"), then get the slot number from the id
			const bagSlotNum = parseInt($bagSlotOverlay.parentNode.id.substr(3));

			state.lockedItemSlots.push(bagSlotNum);
			saveState();

			// Hide context menu
			$inventoryContextMenu.style.display = 'none';

			// Add lock slot in UI
			lockSlot(bagSlotNum);
		});
	}, 0);
}

// Pass `true` as argument to reinitialize even if initd
function renderLockedItemSlots() {
	const state = getState();
	const $inventory = getWindow(WindowNames.inventory);

	if (!$inventory || $inventory.classList.contains('js-locked-slots-initd')) return;
	$inventory.classList.add('js-locked-slots-initd');

	// Initialize locked slots UI
	state.lockedItemSlots.forEach(lockSlot);
}

export default {
	name: 'Locked item slots',
	description:
		'Allows you to lock inventory slots so you can not drop those items or shift+right click them',
	run: ({ registerOnDomChange }) => {
		// Initialize locked item overlays
		renderLockedItemSlots();
		registerOnDomChange(renderLockedItemSlots);

		// Add Lock item choice to inventory context menu
		addLockItemContextMenu();
		registerOnDomChange(addLockItemContextMenu);
	},
};
