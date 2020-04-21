import * as chat from '../../utils/chat';
import { getTooltipContent } from '../../utils/game';
import { getTempState } from '../../utils/state';

async function itemStatsCopy(clickEvent) {
	const tempState = getTempState();

	// This mod only triggers if you alt+right click
	if (!tempState.keyModifiers.alt) {
		return;
	}

	const $elementMouseIsOver = document.elementFromPoint(clickEvent.clientX, clickEvent.clientY);
	// It grabs the .overlay class, which is child of the .slot class we need to grab to get the tooltip
	const $bagSlot = $elementMouseIsOver.parentNode;

	// No item in slot
	if (!$bagSlot.querySelector('img')) {
		return;
	}

	// Once we confirm we want to copy to clipboard, hide context menu
	const $itemContextMenuChoice = document.body.querySelector('.container > .panel > .choice');
	if (!$itemContextMenuChoice) {
		// If context menu isn't open, something is not right - stop what we're doing and exit
		// Seen this happen very rarely when testing
		return;
	}
	const $itemContextMenu = $itemContextMenuChoice.parentNode;
	if ($itemContextMenu) {
		$itemContextMenu.style.display = 'none';
	}

	// Get the texts we want from the tooltip
	const getDetailedTooltips = true;
	const $tooltip = await getTooltipContent($bagSlot, getDetailedTooltips);
	if (!$tooltip) {
		// This _shouldn't_ happen, but very occasionally there is a (likely timing-related) problem getting the tooltip
		return;
	}

	// We get the detailed tooltip, which may have a second comparison tooltip. Remove the comparison tooltip if we have it.
	const $comparisonTooltip = $tooltip.querySelector('.slotdescription');
	if ($comparisonTooltip) $comparisonTooltip.parentNode.removeChild($comparisonTooltip);

	// Collect item name/stats into strings
	const itemName = $tooltip.querySelector('.slottitle').textContent;
	const $itemQuality = $tooltip.querySelector('.type span');

	const itemQuality = $itemQuality.textContent;

	// It's not a piece of equipment, just copy item name and exit
	if (!itemQuality.includes('%')) {
		let trimmedItemName = itemName;
		// If item name starts with T#, e.g. T1, T5, etc, then this was added onto the detailed tooltip
		// It's usually unnecessary information, so we remove it
		// (e.g. shows as "T94 Centrifugal Laceration Lv. 4" instead of "Centrifugal Laceration Lv. 4")
		if (itemName.substr(0, 2).match(/T[0-9]/)) {
			trimmedItemName = itemName.substr(itemName.indexOf(' ') + 1);
		}

		navigator.clipboard.writeText(trimmedItemName);
		chat.addChatMessage(`Copied ${trimmedItemName} to clipboard.`);
		return;
	}

	// We only want the lvl number, so pop off the level number from the "Requires Lv. 17" line
	// To find this line, we search through all the tooltip lines for the line containing "Requires"
	const $lines = Array.from($tooltip.querySelectorAll('.container .pack'));
	const $itemRequirement = $lines.filter($line => $line.textContent.includes('Requires '))[0];
	const itemLvl = $itemRequirement.textContent.split(' ').pop();

	// Grab the stats we care about, i.e. not part of the requirements or item type
	const $stats = Array.from(
		$tooltip.querySelectorAll(`
				.pack > .textpurp,
				.pack > .textblue,
				.pack > .textgreen:not(.slottitle),
				.pack > .textwhite:not(.type)
			`),
	);

	const statsText = $stats
		.map($stat => {
			// We only care about lines starting with a "+ ", showcasing that a piece of gear adds a certain stat
			// The comparison line near the bottom of the tooltip also has a "+", but no space after it. This shows stat differentials vs current gear - we don't want that.
			if ($stat.textContent.substr(0, 2) !== '+ ') return;

			// Return quality percentage only if it exists, otherwise return normal stat
			const $quality = $stat.querySelector('span');
			if ($quality) {
				const quality = $quality.textContent;
				const statLineChunks = $stat.textContent.replace(/\+\s/g, '+').split(' ');
				statLineChunks.pop(); // Remove quality at end
				statLineChunks.shift(); // Remove specific +# at the beginning
				const statName = statLineChunks.join(' ');
				return `${statName} ${quality}`;
			} else {
				return $stat.textContent.trim();
			}
		})
		.filter(statText => !!statText) // Filter out empty stat texts, i.e. if they didn't begin with a "+"
		.join(', ');
	navigator.clipboard.writeText(`${itemName} ${itemQuality} Lv.${itemLvl}: ${statsText}`);
	chat.addChatMessage(`Copied ${itemName}'s stats to clipboard.`);
}

export default {
	name: 'Items stats copy',
	description:
		'When alt+left clicking a piece of equipment in your inventory, its stats will be copied to your clipboard',
	run: ({ registerOnRightClick }) => {
		registerOnRightClick(itemStatsCopy);
	},
};
