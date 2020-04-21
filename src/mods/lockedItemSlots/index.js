import { WindowNames } from '../../utils/ui';
import { getWindow } from '../../utils/game';
import { getState, saveState } from '../../utils/state';
import { makeElement } from '../../utils/misc';
import { lockSlot, initLockedSlots } from './helpers';

function addLockItemContextMenu() {
	const state = getState();
	const $inventory = getWindow(WindowNames.inventory);
	const $contextMenu = document.querySelector(
		'.container > .panel.context:not(.js-lock-menu-initd)',
	);
	if (!$inventory || !$contextMenu) return;

	const $elementUnderContextMenu = document.elementFromPoint(
		$contextMenu.offsetLeft,
		$contextMenu.offsetTop - 10, // Subtract 10px to get element right above context menu, rather than context menu itself
	);
	// If context menu top left is not inside inventory, then this is not the inventory context menu
	// For example, Queue or Party was clicked while inventory was opened
	if (!$inventory.contains($elementUnderContextMenu)) return;

	// Add Lock slot, only if unlock slot doesn't exist
	// Use `setTimeout` to wait for `unlock slot` to be added
	setTimeout(() => {
		// If Lock slot already added, dont add it
		if (document.querySelector('.js-lock-item')) return;

		// If Unlock slot exists, don't add Lock slot
		const isLocked = Array.from($contextMenu.querySelectorAll('.choice')).some(
			$choice => $choice.textContent.toLowerCase() === 'unlock slot',
		);
		if (isLocked) return;

		$contextMenu.appendChild(
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
				$contextMenu.offsetLeft,
				$contextMenu.offsetTop - 10,
			);

			// Parent of overlay is the bag slot. Get its id (e.g. "bag4"), then get the slot number from the id
			// Occasionally $bagSlotOverlay is actually the bag slot itself, not the overlay - if the user has clicked near the edge of the bag
			// In this case, don't use the parentElement
			const bagSlotNum = parseInt(
				$bagSlotOverlay.id
					? $bagSlotOverlay.id.substr(3)
					: $bagSlotOverlay.parentElement.id.substr(3),
			);

			// console.info('bagslotnum lock item', bagSlotNum, $bagSlotOverlay);

			state.lockedItemSlots.push(bagSlotNum);
			saveState();

			// Hide context menu
			$contextMenu.style.display = 'none';

			// Add lock slot in UI
			lockSlot(bagSlotNum);
		});
	}, 0);
}

// Pass `true` as argument to reinitialize even if initd
function renderLockedItemSlots() {
	const $inventory = getWindow(WindowNames.inventory, true);
	const $inventoryContainer = $inventory.parentNode;

	// We listen specifically on the inventory's container to check for `style` changes
	// so we know if the inventory has had its visibility toggled
	const inventoryObserver = new MutationObserver(initLockedSlots);
	inventoryObserver.observe($inventoryContainer, { attributes: true, childList: false });
	initLockedSlots();
}

// Removes non-numbers and duplicates from state.lockedItemSlots, and ensures it is an array
// This is primarily necessary because the original release had a few bugs that allowed a slot
// to be in the state array multiple times, or allowed `null` to be in the array. This isn't expected and caused bugs.
function cleanLockedItemState() {
	const state = getState();

	// If something really went wrong and lockedItemSlots isn't an array, set it to an empty array
	if (!Array.isArray(state.lockedItemSlots)) {
		state.lockedItemSlots = [];
		// console.info('cleared lockedItemSlots');
		saveState();
		return;
	}

	// Remove duplicates and non-numbers
	const cleanedLockItems = Array.from(new Set(state.lockedItemSlots)).filter(
		item => typeof item === 'number',
	);

	const itemsAreSame = cleanedLockItems.sort().join() === state.lockedItemSlots.sort().join();
	if (!itemsAreSame) {
		state.lockedItemSlots = cleanedLockItems;
		saveState();
	}
}

export default {
	name: 'Locked item slots',
	description:
		'Allows you to lock inventory slots so you can not drop those items or shift+right click them',
	run: ({ registerOnDomChange }) => {
		cleanLockedItemState();

		// Initialize locked item overlays
		renderLockedItemSlots();

		// Add Lock item choice to inventory context menu
		addLockItemContextMenu();
		registerOnDomChange(addLockItemContextMenu);
	},
};
