import { handleBuffArrayChange } from './helpers';
import { makeElement } from '../../utils/misc';

function createBuffTooltip() {
	if (document.querySelector('.js-skill-tooltip')) return;

	const buffTooltipHTML = `
        <div class="container js-tooltip-content">
            <div class="slottitle textblue js-tooltip-name"></div>
            <div class="description js-tooltip-desc"></div>
            <div class="uimod-skill-tooltip-text js-buff-tooltip-effects">Effects:</div>
            <div class="js-tooltip-stats"></div>
        </div>
    `;
	const $buffTooltip = makeElement({
		element: 'div',
		class: 'border blue slotdescription uimod-skill-tooltip js-skill-tooltip',
		content: buffTooltipHTML,
	});
	document.querySelector('.layout').appendChild($buffTooltip);
}

// Add observers to every buff array, so we can track skills and add buff tooltip handlers when they appear
function buffTooltips() {
	const $buffArrays = Array.from(
		document.querySelectorAll('.buffarray:not(.js-buffarray-initd)'),
	);

	$buffArrays.forEach($buffArray => {
		$buffArray.classList.add('js-buffarray-initd');
		handleBuffArrayChange($buffArray);
		const buffArrayObserver = new MutationObserver(() => handleBuffArrayChange($buffArray));
		buffArrayObserver.observe($buffArray, { childList: true });
	});
}

// TODO BUGFIX: After buffing yourself, selecting yourself and hovering the buff tooltip sometimes doesnt show the tooltip
export default {
	name: 'Buff Tooltips',
	description: 'In a tooltip, shows a basic description of the buff that you are hovering over.',
	run: ({ registerOnDomChange }) => {
		createBuffTooltip();
		buffTooltips();
		registerOnDomChange(buffTooltips);
	},
};
