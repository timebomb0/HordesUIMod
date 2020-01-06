import { getState, saveState } from '../../utils/state';

function getCurrentCharacterLvl() {
	return Number(document.querySelector('#ufplayer .bgmana > .left').textContent.split('Lv. ')[1]);
}

function getCurrentXp() {
  return Number(document.querySelector('#expbar .progressBar > .left')
		.textContent.split('/')[0]
		.replace(/,/g, '')
		.trim());
}

function getNextLevelXp() {
  return Number(document.querySelector('#expbar .progressBar > .left')
		.textContent.split('/')[1]
		.replace(/,/g, '')
		.replace('EXP','')
		.trim());
}


// user invoked reset of xp meter stats
function resetXpMeterState() {
	const state = getState();

	state.xpMeterState.xpGains = []; // array of xp deltas every second
	state.xpMeterState.averageXp = 0;
	state.xpMeterState.gainedXp = 0;
	saveState();
	document.querySelector('.js-xp-time').textContent = '-:-:-';
}

function msToString(ms) {
	const pad = value => (value < 10 ? `0${value}` : value);
	const hours = pad(Math.floor((ms / (1000 * 60 * 60)) % 60));
	const minutes = pad(Math.floor((ms / (1000 * 60)) % 60));
	const seconds = pad(Math.floor((ms / 1000) % 60));
	return `${hours}:${minutes}:${seconds}`;
}

export { getCurrentCharacterLvl, getCurrentXp, getNextLevelXp, resetXpMeterState, msToString };
