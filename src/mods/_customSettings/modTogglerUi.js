import { getState, saveState } from '../../utils/state';
import { makeElement } from '../../utils/misc';
import mods from '../../mods';
import { setWindowOpen, setWindowClosed, WindowNames } from '../../utils/ui';

function createModToggler() {
	const state = getState();

	let modTogglerHTML = '';
	mods.forEach(mod => {
		if (mod.required || mod.disabled) return; // Don't allow toggling of required mods
		const isEnabled = !state.disabledMods.includes(mod.name);

		modTogglerHTML += `
			<div class="uimod-mod-name">${mod.name}</div>
			<div class="uimod-mod-desc">${mod.description}</div>
			<div class="uimod-mod-state">${isEnabled ? 'Turned on' : 'Turned off'}</div>
			${
				isEnabled
					? `<div class="btn orange js-disable-mod" data-mod-name="${mod.name}">Turn OFF</div>`
					: `<div class="btn blue js-enable-mod" data-mod-name="${mod.name}">Turn ON</div>`
			}
		`;
	});

	const customSettingsHTML = `
		<h3 class="textprimary">UI Mods</h3>
		<div class="uimod-disclaimer">Disclaimer: You MUST refresh the game after you enable/disable a mod for it to take effect.</div>
		<div class="settings uimod-mod-toggler js-mod-toggler-list">${modTogglerHTML}</div>
		<p></p>
		<div class="btn purp js-close-mod-toggler">Close</div>
	`;

	const $customSettings = makeElement({
		element: 'div',
		class: 'menu panel-black uimod-mod-toggler-window uimod-custom-window js-mod-toggler',
		content: customSettingsHTML,
	});
	document.body.appendChild($customSettings);

	setWindowOpen(WindowNames.modToggler);

	// Wire up all the disable/enable mod buttons
	Array.from(document.querySelectorAll('.js-disable-mod')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-mod-name');
			if (!state.disabledMods.includes(name)) {
				// It should never include the mod already, but juuust in case, we don't want to push it twice
				state.disabledMods.push(name);
				saveState();
			}

			// Refresh the window, retaining scroll position
			let $modList = document.querySelector('.js-mod-toggler-list');
			const tempScrollPos = $modList.scrollTop;
			removeModToggler();
			createModToggler();
			$modList = document.querySelector('.js-mod-toggler-list');
			$modList.scrollTop = tempScrollPos;
		});
	});
	Array.from(document.querySelectorAll('.js-enable-mod')).forEach($button => {
		$button.addEventListener('click', clickEvent => {
			const name = clickEvent.target.getAttribute('data-mod-name');
			if (state.disabledMods.includes(name)) {
				state.disabledMods.splice(state.disabledMods.indexOf(name), 1);
				saveState();
			}

			// Refresh the window, retaining scroll position
			let $modList = document.querySelector('.js-mod-toggler-list');
			const tempScrollPos = $modList.scrollTop;
			removeModToggler();
			createModToggler();
			$modList = document.querySelector('.js-mod-toggler-list');
			$modList.scrollTop = tempScrollPos;
		});
	});
	// And the close button for our custom UI
	document.querySelector('.js-close-mod-toggler').addEventListener('click', removeModToggler);
}

function removeModToggler() {
	const $customSettingsWindow = document.querySelector('.js-mod-toggler');
	$customSettingsWindow.parentNode.removeChild($customSettingsWindow);

	setWindowClosed(WindowNames.modToggler);
}

export { createModToggler, removeModToggler };
