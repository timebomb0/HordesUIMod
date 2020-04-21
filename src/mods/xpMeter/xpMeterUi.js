import { setWindowClosed, setWindowOpen, WindowNames } from '../../utils/ui';
import { makeElement } from '../../utils/misc';

function toggleXpMeterVisibility() {
	const xpMeterContainer = document.querySelector('.js-xpmeter');

	// Make it if it doesn't exist for some reason
	if (!xpMeterContainer) {
		createXpMeter();
	}

	xpMeterContainer.style.display = xpMeterContainer.style.display === 'none' ? 'block' : 'none';

	// Save whether xpMeter is currently open or closed in the state
	if (xpMeterContainer.style.display === 'none') {
		setWindowClosed(WindowNames.xpMeter);
	} else {
		setWindowOpen(WindowNames.xpMeter);
	}
}

function createXpMeter() {
	const $layoutContainer = document.querySelector(
		'body > div.layout > div.container:nth-child(1)',
	);

	const xpMeterHTMLString = `
        <div class="l-corner-lr container uimod-xpmeter-1 js-xpmeter" style="display: none">
            <div class="window panel-black uimod-xpmeter-2">
			<div class="titleframe uimod-xpmeter-2">
			<img src="/assets/ui/icons/trophy.svg?v=3282286" class="titleicon svgicon uimod-xpmeter-2">
				<div class="textprimary title uimod-xpmeter-2">
					<div name="title">Experience / XP</div>
				</div>
				<img src="/assets/ui/icons/cross.svg?v=3282286" class="js-xpmeter-close-icon btn black svgicon">
		</div>
                <div class="slot uimod-xpmeter-2" style="">
                    <div class="wrapper uimod-xpmeter-1">
                        <div class="bar  uimod-xpmeter-3" style="z-index: 0;">
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP per minute:</span>
                                <span class="right uimod-xpmeter-3 js-xpm">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP per hour:</span>
                                <span class="right uimod-xpmeter-3 js-xph">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP Gained:</span>
                                <span class="right uimod-xpmeter-3 js-xpg">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">XP Left:</span>
                                <span class="right uimod-xpmeter-3 js-xpl">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">Session Time: </span>
                                <span class="right uimod-xpmeter-3 js-xp-s-time">-</span>
                            </div>
                            <div class="progressBar bgc1 uimod-xpmeter-3" style="width: 100%; font-size: 1em;">
                                <span class="left uimod-xpmeter-3">Time to lvl: </span>
                                <span class="right uimod-xpmeter-3 js-xp-time">-</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid buttons marg-top uimod-xpmeter-1 js-xpmeter-reset-button">
                        <div class="btn grey">Reset</div>
                    </div>
                </div>
            </div>
        </div>
    `;

	const $xpMeterElement = makeElement({
		element: 'div',
		content: xpMeterHTMLString.trim(),
	});
	$layoutContainer.appendChild($xpMeterElement.firstChild);
}

export { toggleXpMeterVisibility, createXpMeter };
