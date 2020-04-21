import skills from './skills';
import { makeElement } from '../../utils/misc';

function _getSkillId(url) {
	const regex = new RegExp('skills/([a-zA-Z0-9]+).');
	const matches = url.match(regex);
	return Array.isArray(matches) ? matches[1] : null;
}

function _getSkillIdFromBuff($buff) {
	const $skillImg = $buff.querySelector('img');
	if (!$skillImg) return;

	return _getSkillId($skillImg.getAttribute('src'));
}

function _addBuffTooltip(mouseEvent, $buff) {
	const skillId = _getSkillIdFromBuff($buff);
	if (!skillId) return;

	const $buffTooltip = document.querySelector('.js-skill-tooltip');

	const skillData = skills[skillId];
	// This shouldn't happen, but just in case it does, don't show the buff tooltip
	if (!skillData) return;

	$buffTooltip.querySelector('.js-tooltip-name').textContent = skillData.name;
	$buffTooltip.querySelector('.js-tooltip-desc').textContent = skillData.description;

	// Reset current tooltip stats and add current skill's stats
	const $tooltipStats = $buffTooltip.querySelector('.js-tooltip-stats');
	$tooltipStats.innerHTML = '';
	if (skillData.stats) {
		$buffTooltip.setAttribute('data-skill-id', skillId);
		$tooltipStats.style.display = 'block';
		$buffTooltip.querySelector('.js-buff-tooltip-effects').style.display = 'block';
		skillData.stats.forEach(statText => {
			$tooltipStats.appendChild(
				makeElement({
					element: 'div',
					class: 'textgreen',
					content: statText,
				}),
			);
		});
	} else {
		$buffTooltip.setAttribute('data-skill-id', '');
		$tooltipStats.style.display = 'none';
		$buffTooltip.querySelector('.js-buff-tooltip-effects').style.display = 'none';
	}

	// Make tooltip visible near mouse
	$buffTooltip.setAttribute(
		'style',
		`left: ${mouseEvent.pageX}px; top: ${mouseEvent.pageY - 50}px; display: block;`,
	);
}

function _removeBuffTooltip() {
	const $buffTooltip = document.querySelector('.js-skill-tooltip');
	if ($buffTooltip) {
		$buffTooltip.style.display = 'none';
	}
}

function _handleBuffTooltipDisplay(mouseEvent, $buff) {
	// TODO: This method should NOT be being called constantly on mouse move of the entire game
	// Maybe a debounced timeout that rebounces on every mousemove of the buffarray, and once it finishes,
	// that means they're no longer hovered over buffarray, so delete the tooltip
	const $elementMouseIsOver = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
	// If mouse is over cooldown overlay or icon image of buff icon
	if (
		$elementMouseIsOver.classList.contains('cd') ||
		$elementMouseIsOver.classList.contains('icon')
	) {
		// If there is no $buff but we are over the buff icon, then this is the document.body
		// _removeBuffTooltip handler, so we don't want to add the buff tooltip
		// TODO: Consider cleaning up this logic
		if ($buff) _addBuffTooltip(mouseEvent, $buff);
	} else {
		_removeBuffTooltip();
	}
}

function handleBuffArrayChange($buffArray) {
	const $buffs = Array.from($buffArray.querySelectorAll('.slot'));

	const visibleSkillIds = [];
	$buffs.forEach($buff => {
		visibleSkillIds.push(_getSkillIdFromBuff($buff));
		if ($buff.classList.contains('js-buff-tooltip-initd')) return;

		$buff.classList.add('js-buff-tooltip-initd');
		// Handle deleting tooltip either on mouseleave or on mousemove outside of the .buffarray
		// Being this comprehensive helps ensure the tooltip doesn't accidentally stay visible inappropriately
		if ($buff.parentElement) {
			$buff.parentElement.addEventListener('mousemove', event =>
				_handleBuffTooltipDisplay(event, $buff),
			);
			$buff.addEventListener('mouseleave', _removeBuffTooltip);
		}
	});

	// If tooltip is visible, check if the skill it was displaying
	// a tooltip for still exists or not in the buff array
	// If it doesn't exist, remove the tooltip
	const currentDisplayedSkillId = document
		.querySelector('.js-skill-tooltip')
		.getAttribute('data-skill-id');
	if (currentDisplayedSkillId && !visibleSkillIds.includes(currentDisplayedSkillId)) {
		_removeBuffTooltip();
	}
}

export { handleBuffArrayChange };
