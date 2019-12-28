// The last clicked UI window displays above all other UI windows
// This is useful when, for example, your inventory is near the market window,
// and you want the window and the tooltips to display above the market window.
function selectedWindowIsTop() {
	Array.from(document.querySelectorAll('.window:not(.js-is-top-initd)')).forEach($window => {
		$window.classList.add('js-is-top-initd');

		$window.addEventListener('mousedown', () => {
			// First, make the other is-top window not is-top
			const $otherWindowContainer = document.querySelector('.js-is-top');
			if ($otherWindowContainer) {
				$otherWindowContainer.classList.remove('js-is-top');
			}

			// Then, make our window's container (the z-index container) is-top
			$window.parentNode.classList.add('js-is-top');
		});
	});
}

export default {
	name: 'Make Selected Window Top',
	description: 'The UI window you click will always be displayed over other UI windows',
	run: ({ registerOnDomChange }) => {
		selectedWindowIsTop();

		// As windows are opened, we want to enable them to become the top window when they're clicked
		registerOnDomChange(selectedWindowIsTop);
	},
};
