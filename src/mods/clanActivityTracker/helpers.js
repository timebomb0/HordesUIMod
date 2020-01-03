import { makeElement } from '../../utils/misc';
import { getState, saveState, getTempState } from '../../utils/state';

function _lastSeenFromTimestamp(ts) {
	if (!ts) return 'Never';

	const nowTs = Date.now();
	const seconds = (nowTs - ts) / 1000; // Divide by 1000 because Date.now returns milliseconds
	const minutes = seconds / 60;
	const hours = minutes / 60;
	const days = hours / 24;
	const weeks = days / 7;
	const months = weeks / 30;
	const years = months / 12;

	const getPluralizedText = (num, word) => {
		num = Math.round(num);
		return num === 1 ? `${num} ${word}` : `${num} ${word}s`;
	};
	if (seconds < 60) return `${getPluralizedText(seconds, 'second')} ago`;
	if (minutes < 60) return `${getPluralizedText(minutes, 'minute')} ago`;
	if (hours < 24) return `${getPluralizedText(hours, 'hour')} ago`;
	if (days < 7) return `${getPluralizedText(days, 'day')} ago`;
	if (days < 30) return `${getPluralizedText(weeks, 'week')} ago`;
	if (months < 12) return `${getPluralizedText(months, 'month')} ago`;
	return `${getPluralizedText(years, 'year')} ago`;
}

function _handleClanMemberTableChange() {
	const state = getState();
	const $clanLastSeenTable = document.querySelector('.js-clan-lastseen-table');
	const $clanMemberTable = document.querySelector('.js-clan-members-table-initd');

	// Update+Save current online users last seen time
	const currentTimestamp = Date.now();
	const $memberNames = Array.from($clanMemberTable.querySelectorAll('tr .name'));
	const latestMemberNames = [];
	$memberNames.map($name => {
		const isOnline = !$name.parentNode.parentNode.classList.contains('offline');
		const name = $name.textContent.trim();

		if (isOnline) {
			// Update current timestamp of online members
			state.clanLastActiveMembers[name] = currentTimestamp;
		} else if (!state.clanLastActiveMembers.hasOwnProperty(name)) {
			// If not existing in state, add them so that we can check update their last seen time when they type in chat (See `refreshLastSeenClanMember`)
			state.clanLastActiveMembers[name] = null;
		}
		latestMemberNames.push(name);
	});
	// Remove clan members that've left the clan from state, so their last seen time is no longer tracked when they type in chat
	const removedMembers = Object.keys(state.clanLastActiveMembers).filter(
		nameInState => !latestMemberNames.includes(nameInState),
	);
	removedMembers.forEach(removedName => delete state.clanLastActiveMembers[removedName]);
	saveState();

	// Update changed last seen times in DOM
	const $names = Array.from($clanMemberTable.querySelectorAll('tr .name'));
	const $lastSeenRows = Array.from($clanLastSeenTable.querySelectorAll('.js-clan-lastseen-row'));

	// If necessary, update the quantity of rows in our custom table
	const $tableBody = $clanLastSeenTable.querySelector('tbody');
	if ($names.length !== $lastSeenRows.length) {
		const $newRow = makeElement({
			element: 'tr',
			class: 'striped js-clan-lastseen-row',
			content: '<td></td>',
		});
		if ($names.length > $lastSeenRows.length) {
			// Add last seen rows to match names length
			const rowsToAddCount = $names.length - $lastSeenRows.length;
			for (var i = 0; i < rowsToAddCount; i++) {
				$tableBody.appendChild($newRow.cloneNode(true));
			}
		} else {
			// Remove last seen rows to match names length
			const rowsToRemoveCount = $lastSeenRows.length - $names.length;
			for (var i = 0; i < rowsToRemoveCount; i++) {
				$tableBody.querySelector('tr').remove();
			}
		}
	}

	// Update last seen rows with appropriate last seen time
	const $tableRows = Array.from($tableBody.querySelectorAll('td'));
	$names.forEach(($name, index) => {
		const name = $name.textContent.trim();
		const isOnline = state.clanLastActiveMembers[name] === currentTimestamp;
		const lastSeenStr = isOnline
			? 'Now'
			: _lastSeenFromTimestamp(state.clanLastActiveMembers[name]);

		const $tableRow = $tableRows[index];
		const rowLastSeenStr = $tableRow.textContent;

		const isLastSeenChanged = rowLastSeenStr !== lastSeenStr;
		if (isLastSeenChanged) $tableRow.textContent = lastSeenStr;

		// Mirroring the 50% opacity that the normal clan member table has on offline members
		const lineClassList = $tableRow.parentNode.classList;
		const displayingRowAsOffline = lineClassList.contains('js-offline-member');
		if (!isOnline && !displayingRowAsOffline) {
			lineClassList.add('js-offline-member');
		} else if (isOnline && displayingRowAsOffline) {
			lineClassList.remove('js-offline-member');
		}
	});
}

function handleClanWindowChange() {
	const state = getState();
	const tempState = getTempState();

	const $clanWindow = document.querySelector('.window .clanView');
	// Table takes a moment to be created after clanView window is opened
	const $clanMemberTable = $clanWindow.querySelector('table:not(.js-clan-lastseen-table)');
	if (!$clanMemberTable) return;

	// Initialize the table column if we haven't already
	if (!$clanWindow.classList.contains('js-clan-members-table-initd')) {
		$clanWindow.classList.add('js-clan-members-table-initd');
		$clanMemberTable.classList.add('uimod-clan-members-table');
		// We add a new table next to the preexisting table.
		// We don't just add a new column because Svelte changes the columns and rows around
		// a lot, pretty randomly. This leads to our right-most column occasionally bugging out
		// and ending up as the left-most column.
		// Using our own table lets us control everything about it without Svelte interfering.
		$clanMemberTable.parentNode.appendChild(
			makeElement({
				element: 'table',
				class: 'marg-top panel-black js-clan-lastseen-table uimod-clan-lastseen-table',
				content: `
                    <thead>
                        <tr class="textprimary">
                            <th>Last seen</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr class="striped js-clan-lastseen-row">
                        <td></td>
                    </tr>
                    </tbody>
                `,
			}),
		);

		// Reset last active members state if clan has changed
		const clanName = $clanWindow.querySelector('.textcenter h1').textContent;
		if (clanName !== state.currentClanName) {
			state.currentClanName = clanName.trim();
			state.clanLastActiveMembers = {};
			saveState();
		}
	}

	if (!tempState.clanTableObserver) {
		_handleClanMemberTableChange();
		tempState.clanTableObserver = new MutationObserver(_handleClanMemberTableChange);
		tempState.clanTableObserver.observe($clanMemberTable, {
			attributes: true,
			childList: true,
			subtree: true,
		});
	}
}

export { handleClanWindowChange };
