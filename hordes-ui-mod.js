// ==UserScript==
// @name         Hordes UI Mod
// @version      0.151
// @description  Various UI mods for Hordes.io.
// @author       Sakaiyo
// @match        https://hordes.io/play
// @grant        GM_addStyle
// ==/UserScript==
/**
  * TODO: Implement chat tabs
  * TODO: Implement inventory sorting
  * TODO: (Maybe) Improved healer party frames
  * TODO: Opacity scaler for map
  *       Check if it's ok to emulate keypresses before releasing. If not, then maybe copy text to clipboard.
  * TODO: FIX BUG: Add support for resizing map back to saved position after minimizing it, from maximized position
  * TODO (Maybe): Ability to make GM chat look like normal chat?
  * TODO: Add toggleable option to include chat messages to right of party frame
  * TODO: Remove all reliance on svelte- classes, likely breaks with updates
  */
(function() {
    'use strict';

    // If this version is different from the user's stored state,
    // e.g. they have upgraded the version of this script and there are breaking changes,
    // then their stored state will be deleted.
    const BREAKING_VERSION = 1;
    const VERSION = '0.150'; // Should match version in UserScript description

    // The width+height of the maximized chat, so we don't save map size when it's maximized
    // TODO: FIX BUG: This is NOT everyones max size. INSTEAD OF USING A STATIC SIZE, we should detect large instant resizes
    // Should also do this to avoid saving when minimizing menu after maximizing
    const CHAT_MAXIMIZED_SIZE = 692;

    const STORAGE_STATE_KEY = 'hordesio-uimodsakaiyo-state';
    const CHAT_GM_CLASS = 'js-chat-gm';

    let state = {
    	breakingVersion: BREAKING_VERSION,
    	chat: {
    		GM: true,
    	},
    	windowsPos: {},
    	blockList: {},
    };
    // tempState is saved only between page refreshed.
    const tempState = {
    	// The last name clicked in chat
    	chatName: null
    };

    // UPDATING STYLES BELOW - Must be invoked in main function
    GM_addStyle(`
    	/* Transparent chat bg color */
		.frame.svelte-1vrlsr3 {
			background: rgba(0,0,0,0.4);
		}

		/* Transparent map */
		.svelte-hiyby7 {
			opacity: 0.7;
		}

		/* Our mod's chat message color */
		.textuimod {
			color: #00dd33;
		}

		/* Allows windows to be moved */
		.window {
			position: relative;
		}

		/* Allows last clicked window to appear above all other windows */
		.js-is-top {
			z-index: 9998 !important;
		}
		.panel.context:not(.commandlist) {
			z-index: 9999 !important;
		}
		/* The item icon being dragged in the inventory */
		.container.svelte-120o2pb {
			z-index: 9999 !important;
		}

		/* Custom chat context menu, invisible by default */
		.js-chat-context-menu {
			display: none;
		}

		.js-chat-context-menu .name {
			color: white;
			padding: 2px 4px;
		}

		/* Allow names in chat to be clicked */
		#chat .name {
			pointer-events: all !important;
		}

		/* Custom chat filter colors */
		.js-chat-gm {
			color: #a6dcd5;
		}

		/* Class that hides chat lines */
		.js-line-hidden,
		.js-line-blocked {
			display: none;
		}

		/* Enable chat & map resize */
		.js-chat-resize {
			resize: both;
			overflow: auto;
		}
		.js-map-resize:hover {
			resize: both;
			overflow: auto;
			direction: rtl;
		}

		/* The browser resize icon */
		*::-webkit-resizer {
	        background: linear-gradient(to right, rgba(51, 77, 80, 0), rgba(203, 202, 165, 0.5));
		    border-radius: 8px;
		    box-shadow: 0 1px 1px rgba(0,0,0,1);
		}
		*::-moz-resizer {
	        background: linear-gradient(to right, rgba(51, 77, 80, 0), rgba(203, 202, 165, 0.5));
		    border-radius: 8px;
		    box-shadow: 0 1px 1px rgba(0,0,0,1);
		}

		/* Custom css for settings page, duplicates preexisting settings pane grid */
		.uimod-settings {
			display: grid;
			grid-template-columns: 2fr 3fr;
			grid-gap: 8px;
			align-items: center;
			max-height: 390px;
			margin: 0 20px;
		}
		/* The custom settings main window, closely mirrors main settings window */
		.uimod-custom-settings {
			position: absolute;
			top: 100px;
		    left: 50%;
		    transform: translate(-50%, 0);
		    min-width: 350px;
		    max-width: 600px;
		    width: 90%;
		    height: 80%;
		    min-height: 350px;
		    max-height: 500px;
		    z-index: 9;
		    padding: 0px 10px 5px;
		}
	`);


    const modHelpers = {
    	// Filters all chat based on custom filters
    	filterAllChat: () => {
    		// Blocked user filter
    		Object.keys(state.blockList).forEach(blockedName => {
    			// Get the `.name` elements from the blocked user, if we haven't already hidden their messages
    			const $blockedChatNames = Array.from(document.querySelectorAll(`[data-chat-name="${blockedName}"]:not(.js-line-blocked)`));
    			// Hide each of their messages
    			$blockedChatNames.forEach($name => {
    				// Add the class name to $name so we can track whether it's been hidden in our CSS selector $blockedChatNames
    				$name.classList.add('js-line-blocked');
    				const $line = $name.parentNode.parentNode.parentNode;
    				// Add the class name to $line so we can visibly hide the entire chat line
    				$line.classList.add('js-line-blocked');
    			});
    		})

    		// Custom channel filter
	    	Object.keys(state.chat).forEach(channel => {
		  		Array.from(document.querySelectorAll(`.text${channel}.content`)).forEach($textItem => {
		  			const $line = $textItem.parentNode.parentNode;
		  			$line.classList.toggle('js-line-hidden', !state.chat[channel]);
		  		});
	    	});
		},

		// Makes chat context menu visible and appear under the mouse
		showChatContextMenu: (name, mousePos) => {
			const $contextMenu = document.querySelector('.js-chat-context-menu');
			$contextMenu.querySelector('.js-name').textContent = name;
			$contextMenu.setAttribute('style', `display: block; left: ${mousePos.x}px; top: ${mousePos.y}px;`);
		},

		// Close chat context menu if clicking outside of it
		closeChatContextMenu: clickEvent => {
    		const $target = clickEvent.target;
    		// If clicking on name or directly on context menu, don't close it
    		// Still closes if clicking on context menu item
    		if ($target.classList.contains('js-is-context-menu-initd') 
    			|| $target.classList.contains('js-chat-context-menu')) {
    			return;
    		}

    		const $contextMenu = document.querySelector('.js-chat-context-menu');
    		$contextMenu.setAttribute('style', 'display: none');
    	},

    	// Adds player to block list, to be filtered out of chat
    	blockPlayer: playerName => {
    		if (state.blockList[playerName]) {
    			return;
    		}
    		
    		state.blockList[playerName] = true;
    		modHelpers.filterAllChat();
    		modHelpers.addChatMessage(`${playerName} has been blocked.`)
    		save({blockList: state.blockList});
    	},

    	// Removes player from block list and makes their messages visible again
    	unblockPlayer: playerName => {
    		delete state.blockList[playerName];
    		modHelpers.addChatMessage(`${playerName} has been unblocked.`);
    		save({blockList: state.blockList});

    		// Make messages visible again
    		const $chatNames = Array.from(document.querySelectorAll(`.js-line-blocked[data-chat-name="${playerName}"]`));
    		$chatNames.forEach($name => {
    			$name.classList.remove('js-line-blocked');
    			const $line = $name.parentNode.parentNode.parentNode;
    			$line.classList.remove('js-line-blocked');
    		});
    	},

    	// Pushes message to chat
    	// TODO: The margins for the message are off slightly compared to other messages - why?
    	addChatMessage: text => {
    		const newMessageHTML = `
			<div class="linewrap svelte-1vrlsr3">
				<span class="time svelte-1vrlsr3">00.00</span>
				<span class="textuimod content svelte-1vrlsr3">
				<span class="capitalize channel svelte-1vrlsr3">UIMod</span>
				</span>
				<span class="svelte-1vrlsr3">${text}</span>
			</div>
    		`;

    		const element = makeElement({
    			element: 'article',
    			class: 'line svelte-1vrlsr3',
    			content: newMessageHTML});
    		document.querySelector('#chat').appendChild(element);
    	},
    };

    // MAIN MODS BELOW
    const mods = [
    	// Creates DOM elements for custom chat filters
    	function newChatFilters() {
	    	const $channelselect = document.querySelector('.channelselect');
	    	if (!document.querySelector(`.${CHAT_GM_CLASS}`)) {
				const $gm = makeElement({
		        	element: 'small',
		        	class: `btn border black ${CHAT_GM_CLASS} ${state.chat.GM ? '' : 'textgrey'}`,
		        	content: 'GM'
		        });
		        $channelselect.appendChild($gm);
		    }
	    },

    	// Wire up new chat buttons to toggle in state+ui
    	function newChatFilterButtons() {
    		const $chatGM = document.querySelector(`.${CHAT_GM_CLASS}`);
    		$chatGM.addEventListener('click', () => {
    			state.chat.GM = !state.chat.GM;
    			$chatGM.classList.toggle('textgrey', !state.chat.GM);
    			modHelpers.filterAllChat();
    			save({chat: state.chat});
    		});
    	},

    	// Filter out chat in UI based on chat buttons state
    	function filterChatObserver() {
		    const chatObserver = new MutationObserver(modHelpers.filterAllChat);
			chatObserver.observe(document.querySelector('#chat'), { attributes: true, childList: true });
    	},

    	// Drag all windows by their header
    	function draggableUIWindows() {
    		Array.from(document.querySelectorAll('.window:not(.js-can-move)')).forEach($window => {
    			$window.classList.add('js-can-move');
				dragElement($window, $window.querySelector('.titleframe'));
    		});
    	},

    	// Save dragged UI windows position to state
    	function saveDraggedUIWindows() {
    		Array.from(document.querySelectorAll('.window:not(.js-window-is-saving)')).forEach($window => {
    			$window.classList.add('js-window-is-saving');
    			const $draggableTarget = $window.querySelector('.titleframe');
    			const windowName = $draggableTarget.querySelector('[name="title"]').textContent;
    			$draggableTarget.addEventListener('mouseup', () => {
    				state.windowsPos[windowName] = $window.getAttribute('style');
    				save({windowsPos: state.windowsPos});
    			});
    		});
    	},

    	// Loads draggable UI windows position from state
    	function loadDraggedUIWindowsPositions() {
    		Array.from(document.querySelectorAll('.window:not(.js-has-loaded-pos)')).forEach($window => {
    			$window.classList.add('js-has-loaded-pos');
				const windowName = $window.querySelector('[name="title"]').textContent;
				const pos = state.windowsPos[windowName];
				if (pos) {
					$window.setAttribute('style', pos);
				}
    		});
    	},

    	// Makes chat resizable
    	function resizableChat() {
    		// Add the appropriate classes
    		const $chatContainer = document.querySelector('#chat').parentNode;
    		$chatContainer.classList.add('js-chat-resize');

    		// Load initial chat and map size
    		if (state.chatWidth && state.chatHeight) {
	    		$chatContainer.style.width = state.chatWidth;
	    		$chatContainer.style.height = state.chatHeight;
	    	}

    		// Save chat size on resize
    		const resizeObserverChat = new ResizeObserver(() => {
    			const chatWidthStr = window.getComputedStyle($chatContainer, null).getPropertyValue('width');
    			const chatHeightStr = window.getComputedStyle($chatContainer, null).getPropertyValue('height');
    			save({
    				chatWidth: chatWidthStr,
    				chatHeight: chatHeightStr,
    			});
    		});
    		resizeObserverChat.observe($chatContainer);
    	},

    	// Makes map resizable
    	function resizeableMap() {
    		const $map = document.querySelector('.svelte-hiyby7');
    		const $canvas = $map.querySelector('canvas');
    		$map.classList.add('js-map-resize');

    		const onMapResize = () => {
    			// Get real values of map height/width, excluding padding/margin/etc
    			const mapWidthStr = window.getComputedStyle($map, null).getPropertyValue('width');
    			const mapHeightStr = window.getComputedStyle($map, null).getPropertyValue('height');
    			const mapWidth = Number(mapWidthStr.slice(0, -2));
    			const mapHeight = Number(mapHeightStr.slice(0, -2));

    			// If height/width are 0 or unset, don't resize canvas
    			if (!mapWidth || !mapHeight) {
    				return;
    			}

    			if ($canvas.width !== mapWidth) {
    				$canvas.width = mapWidth;
    			}

    			if ($canvas.height !== mapHeight) {
    				$canvas.height = mapHeight;
    			}

    			// Save map size on resize, unless map has been maximized by user
    			if (mapWidth !== CHAT_MAXIMIZED_SIZE && mapHeight !== CHAT_MAXIMIZED_SIZE) {
    				save({
    					mapWidth: mapWidthStr,
    					mapHeight: mapHeightStr,
    				});
    			}
    		};

	    	if (state.mapWidth && state.mapHeight) {
	    		$map.style.width = state.mapWidth;
	    		$map.style.height = state.mapHeight;
	    		onMapResize(); // Update canvas size on initial load of saved map size
	    	}

    		// On resize of map, resize canvas to match
    		const resizeObserverMap = new ResizeObserver(onMapResize);
    		resizeObserverMap.observe($map);

    		// We need to observe canvas resizes to tell when the user presses M to open the big map
    		// At that point, we resize the map to match the canvas
    		const triggerResize = () => {
    			// Get real values of map height/width, excluding padding/margin/etc
    			const mapWidthStr = window.getComputedStyle($map, null).getPropertyValue('width');
    			const mapHeightStr = window.getComputedStyle($map, null).getPropertyValue('height');
    			const mapWidth = Number(mapWidthStr.slice(0, -2));
    			const mapHeight = Number(mapHeightStr.slice(0, -2));

    			// If height/width are 0 or unset, we don't care about resizing yet
    			if (!mapWidth || !mapHeight) {
    				return;
    			}

    			if ($canvas.width !== mapWidth) {
    				$map.style.width = `${$canvas.width}px`;
    			}

    			if ($canvas.height !== mapHeight) {
    				$map.style.height = `${$canvas.height}px`;
    			}
    		};

    		// We debounce the canvas resize, so it doesn't resize every single
    		// pixel you move when resizing the DOM. If this were to happen,
    		// resizing would constantly be interrupted. You'd have to resize a tiny bit,
    		// lift left click, left click again to resize a tiny bit more, etc.
    		// Resizing is smooth when we debounce this canvas.
	    	const debouncedTriggerResize = debounce(triggerResize, 200);
    		const resizeObserverCanvas = new ResizeObserver(debouncedTriggerResize);
    		resizeObserverCanvas.observe($canvas);
    	},

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
    	},

    	function customSettings() {
    		const $settings = document.querySelector('.divide:not(.js-settings-initd)');
    		if (!$settings) {
    			return;
    		}

    		$settings.classList.add('js-settings-initd');
    		const $settingsChoiceList = $settings.querySelector('.choice').parentNode;
    		$settingsChoiceList.appendChild(makeElement({
    			element: 'div',
    			class: 'choice js-blocked-players',
    			content: 'Blocked players',
    		}));

    		// Upon click, we display our custom settings window UI
    		document.querySelector('.js-blocked-players').addEventListener('click', () => {
    			let blockedPlayersHTML = '';
    			Object.keys(state.blockList).sort().forEach(blockedName => {
    				blockedPlayersHTML += `
    					<div data-player-name="${blockedName}">${blockedName}</div>
    					<div class="btn orange js-unblock-player" data-player-name="${blockedName}">Unblock player</div>
					`;
    			});

    			const customSettingsHTML = `
    				<h3 class="textprimary">Blocked players</h3>
    				<div class="settings uimod-settings">${blockedPlayersHTML}</div>
    				<p></p>
    				<div class="btn blue js-close-custom-settings">Close</div>
    			`;

    			const $customSettings = makeElement({
    				element: 'div',
    				class: 'menu panel-black js-custom-settings uimod-custom-settings',
    				content: customSettingsHTML,
    			});
    			document.body.appendChild($customSettings);

    			// Wire up all the unblock buttons
    			Array.from(document.querySelectorAll('.js-unblock-player')).forEach($button => {
    				$button.addEventListener('click', clickEvent => {
    					const name = clickEvent.target.getAttribute('data-player-name');
    					modHelpers.unblockPlayer(name);

    					// Remove the blocked player from the list
    					Array.from(document.querySelectorAll(`[data-player-name="${name}"]`)).forEach($element => {
    						$element.parentNode.removeChild($element);
    					});
    				});
    			});
    			// And the close button for our custom UI
    			document.querySelector('.js-close-custom-settings').addEventListener('click', () => {
    				const $customSettingsWindow = document.querySelector('.js-custom-settings');
    				$customSettingsWindow.parentNode.removeChild($customSettings);
    			});
    		});
    	},

    	// This creates the initial chat context menu (which starts as hidden)
    	function createChatContextMenu() {
    		if (document.querySelector('.js-chat-context-menu')) {
    			return;
    		}

    		document.body.appendChild(makeElement({
    			element: 'div',
    			class: 'panel context border grey js-chat-context-menu',
    			content: `
    				<div class="js-name">...</div>
    				<div class="choice" name="party">Party invite</div>
    				<div class="choice" name="whisper">Whisper</div>
    				<div class="choice" name="block">Block</div>
    			`,
    		}));

    		const $chatContextMenu = document.querySelector('.js-chat-context-menu');
    		$chatContextMenu.querySelector('[name="party"]').addEventListener('click', () => {
				enterTextIntoChat(`/partyinvite ${tempState.chatName}`);
				submitChat();
    		});
    		$chatContextMenu.querySelector('[name="whisper"]').addEventListener('click', () => {
    			enterTextIntoChat(`/whisper ${tempState.chatName} `);
    		});
    		$chatContextMenu.querySelector('[name="block"]').addEventListener('click', () => {
    			modHelpers.blockPlayer(tempState.chatName);
    		})
    	},

    	// This opens a context menu when you click a user's name in chat
    	function chatContextMenu() {
    		Array.from(document.querySelectorAll('.name:not(.js-is-context-menu-initd)')).forEach($name => {
    			$name.classList.add('js-is-context-menu-initd');
    			// Add name to element so we can target it in CSS when filtering chat for block list
    			$name.setAttribute('data-chat-name', $name.textContent);

    			const showContextMenu = clickEvent => {
    				// TODO: Is there a way to pass the name to showChatContextMenumethod, instead of storing in tempState?
    				tempState.chatName = $name.textContent;
    				modHelpers.showChatContextMenu($name.textContent, {x: clickEvent.pageX, y: clickEvent.pageY});
    			};
    			$name.addEventListener('click', showContextMenu);
    		});
    	},
    ];

    // Add new DOM, load our stored state, wire it up, then continuously rerun specific methods whenever UI changes
    function initialize() {
    	// If the Hordes.io tab isn't active for long enough, it reloads the entire page, clearing this mod
    	// We check for that and reinitialize the mod if that happens
    	const $layout = document.querySelector('.layout');
    	if ($layout.classList.contains('uimod-initd')) {
    		return;
    	}

    	modHelpers.addChatMessage(`Hordes UI Mod v${VERSION} by Sakaiyo has been initialized.`);

    	$layout.classList.add('uimod-initd')
		load();
        mods.forEach(mod => mod());

        // Continuously re-run specific mods methods that need to be executed on UI change
		const rerunObserver = new MutationObserver(() => {
			// If new window appears, e.g. even if window is closed and reopened, we need to rewire it
        	// Fun fact: Some windows always exist in the DOM, even when hidden, e.g. Inventory
        	// 		     But some windows only exist in the DOM when open, e.g. Interaction
        	const modsToRerun = [
        		'saveDraggedUIWindows',
        		'draggableUIWindows',
        		'loadDraggedUIWindowsPositions',
        		'selectedWindowIsTop',
        		'customSettings',
    		];
        	modsToRerun.forEach(modName => {
        		mods.find(mod => mod.name === modName)();
        	});
		});
		rerunObserver.observe(document.querySelector('.layout > .container'), { attributes: false, childList: true, });

		// Rerun only on chat
		const chatRerunObserver = new MutationObserver(() => {
			mods.find(mod => mod.name === 'chatContextMenu')();
			modHelpers.filterAllChat();

		});
		chatRerunObserver.observe(document.querySelector('#chat'), { attributes: false, childList: true, });

		// Event listeners for document.body might be kept when the game reloads, so don't reinitialize them
		if (!document.body.classList.contains('js-uimod-initd')) {
			document.body.classList.add('js-uimod-initd');

			// Close chat context menu when clicking outside of it
			document.body.addEventListener('click', modHelpers.closeChatContextMenu);
		}
    }

    // Initialize mods once UI DOM has loaded
    const pageObserver = new MutationObserver(() => {
	    const isUiLoaded = !!document.querySelector('.layout');
	    if (isUiLoaded) {
	    	initialize();
	    }
	});
	pageObserver.observe(document.body, { attributes: true, childList: true })

	// UTIL METHODS
	// Save to in-memory state and localStorage to retain on refresh
	// TODO: Can use this solely to save to storage - dont need to update state, we already do that ourselves a lot
	function save(items) {
		state = {
			...state,
			...items,
		};
		localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
	}

	// Load localStorage state if it exists
	// NOTE: If user is trying to load unsupported version of stored state,
	//       e.g. they just upgraded to breaking version, then we delete their stored state
	function load() {
		const storedStateJson = localStorage.getItem(STORAGE_STATE_KEY)
		if (storedStateJson) {
			const storedState = JSON.parse(storedStateJson);
			if (storedState.breakingVersion !== BREAKING_VERSION) {
				localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
				return;
			}
			state = {
				...state,
				...storedState,
			};
		}
	}

	// Nicer impl to create elements in one method call
	function makeElement(args) {
		const $node = document.createElement(args.element);
		if (args.class) { $node.className = args.class; }
		if (args.content) { $node.innerHTML = args.content; }
		if (args.src) { $node.src = args.src; }
		return $node;
	}

	function enterTextIntoChat(text) {
		// Open chat input
		const enterEvent = new KeyboardEvent('keydown', {
		    bubbles: true, cancelable: true, keyCode: 13
		});
		document.body.dispatchEvent(enterEvent);

		// Place text into chat
		const $input = document.querySelector('#chatinput input');
		$input.value = text;

		// Get chat input to recognize slash commands and change the channel
		// by triggering the `input` event.
		// (Did some debugging to figure out the channel only changes when the
		//  svelte `input` event listener exists.)
		const inputEvent = new KeyboardEvent('input', {
			bubbles: true, cancelable: true
		})
		$input.dispatchEvent(inputEvent);
	}

	function submitChat() {
		const $input = document.querySelector('#chatinput input');
		const kbEvent = new KeyboardEvent('keydown', {
		    bubbles: true, cancelable: true, keyCode: 13
		});
		$input.dispatchEvent(kbEvent);
	}

	// Credit: https://stackoverflow.com/a/14234618 (Has been slightly modified)
	// $draggedElement is the item that will be dragged.
	// $dragTrigger is the element that must be held down to drag $draggedElement
	function dragElement($draggedElement, $dragTrigger) {
		let offset = [0,0];
		let isDown = false;
		$dragTrigger.addEventListener('mousedown', function(e) {
		    isDown = true;
		    offset = [
		        $draggedElement.offsetLeft - e.clientX,
		        $draggedElement.offsetTop - e.clientY
		    ];
		}, true);
		document.addEventListener('mouseup', function() {
		    isDown = false;
		}, true);

		document.addEventListener('mousemove', function(e) {
		    event.preventDefault();
		    if (isDown) {
		        $draggedElement.style.left = (e.clientX + offset[0]) + 'px';
		        $draggedElement.style.top = (e.clientY + offset[1]) + 'px';
		    }
		}, true);
	}

	// Credit: David Walsh
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
})();