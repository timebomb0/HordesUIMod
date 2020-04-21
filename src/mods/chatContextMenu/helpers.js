// Makes chat context menu visible and appear under the mouse
function showChatContextMenu(name, mousePos, registeredMenuItems) {
	// Right before we show the context menu, we want to check if we should hide/unhide any of the menu items
	const $contextMenu = document.querySelector('.js-chat-context-menu');
	const $menuItems = Array.from($contextMenu.querySelectorAll('[name]'));
	$menuItems.forEach($menuItem => {
		const id = $menuItem.getAttribute('name');
		const handleVisibilityCheck =
			registeredMenuItems[id] && registeredMenuItems[id].handleVisibilityCheck;
		if (handleVisibilityCheck) {
			const isVisible = handleVisibilityCheck();
			$menuItem.classList.toggle('js-hidden', !isVisible);
		}
	});

	$contextMenu.querySelector('.js-name').textContent = name;
	$contextMenu.setAttribute(
		'style',
		`display: block; left: ${mousePos.x}px; top: ${mousePos.y}px;`,
	);
}

export { showChatContextMenu };
