import { handleHealthChange } from './helpers';

function healthColorChanger() {
	const $healthBars = Array.from(
		document.querySelectorAll('.progressBar.bghealth:not(.js-healthchanger-initd)'),
	);

	$healthBars.forEach($healthBar => {
		$healthBar.classList.add('js-healthchanger-initd');
		handleHealthChange($healthBar);
		const observer = new MutationObserver(mutations => handleHealthChange(mutations[0].target));
		observer.observe($healthBar, {
			attributes: true, // When style changes, width has changed, i.e. health percentage has changed
		});
	});
}

export default {
	name: 'Health color changer',
	description:
		'Changes the green color of allied player health bars to become darker and redder as your health gets lower',
	run: ({ registerOnDomChange }) => {
		registerOnDomChange(healthColorChanger);
		healthColorChanger();
	},
};
