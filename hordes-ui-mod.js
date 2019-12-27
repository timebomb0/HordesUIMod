// ==UserScript==
// @name         Hordes UI Mod
// @version      0.191
// @description  Various UI mods for Hordes.io.
// @author       Sakaiyo & Chandog#6373
// @match        https://hordes.io/play
// @grant        GM_addStyle
// ==/UserScript==
/**
  * TODO: Add whisper chat filter
  * TODO: Implement inventory sorting
  * TODO: (Maybe) Improved healer party frames
  * TODO: FIX BUG: Add support for resizing map back to saved position after minimizing it, from maximized position
  * TODO: (Maybe): Add toggleable option to include chat messages to right of party frame
  * TODO: Remove all reliance on svelte- classes, likely breaks with updates
  * TODO: Add cooldown on skills (leverage skill icon URL, have a map for each skill icon mapping to its respective cooldown)
  * TODO: Clicking names in party to add as friends
  * TODO: (MAYBE, Confirm if dev is ok w it) Ctrl clicking item in inventory when Merchant is open to paste item name into search field, and search
  * TODO: (MAYBE, confirm if dev is ok w it) Ctrl clicking item to copy details so user can paste in chat
  */
(function () {
    'use strict';

    // If this version is different from the user's stored state,
    // e.g. they have upgraded the version of this script and there are breaking changes,
    // then their stored state will be deleted.
    const BREAKING_VERSION = 1;
    const VERSION = '0.190'; // Should match version in UserScript description

    const DEFAULT_CHAT_TAB_NAME = 'Untitled';
    const STORAGE_STATE_KEY = 'hordesio-uimodsakaiyo-state';

    let state = {
        breakingVersion: BREAKING_VERSION,
        chat: {
            GM: true,
        },
        windowsPos: {},
        blockList: {},
        friendsList: {},
        mapOpacity: 70, // e.g. 70 = opacity: 0.7
        friendNotes: {},
        chatTabs: [],
        xpMeterState: {
            currentXp: 0,
            xpArr: [],
            averageXp: 0,
            gainedXp: 0
        }
    };

    // tempState is saved only between page refreshes.
    const tempState = {
        // The last name clicked in chat
        chatName: null,
        lastMapWidth: 0,
        lastMapHeight: 0,
        xpMeterInterval: null,
    };

    // UPDATING STYLES BELOW - Must be invoked in main function
    GM_addStyle(`
    	/* Transparent chat bg color */
		.frame.svelte-1vrlsr3 {
			background: rgba(0,0,0,0.4);
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

		/* All purpose hidden class */
		.js-hidden {
			display: none;
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
		#chat .name,
		.textwhisper .textf1 {
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

		.js-map-btns {
			position: absolute;
			top: 46px;
			right: 12px;
			z-index: 999;
			width: 100px;
			height: 100px;
			text-align: right;
			display: none;
			pointer-events: all;
		}
		.js-map-btns:hover {
			display: block;
		}
		.js-map-btns button {
			border-radius: 10px;
			font-size: 18px;
			padding: 0 5px;
			background: rgba(0,0,0,0.4);
			border: 0;
			color: white;
			font-weight: bold;
			pointer: cursor;
		}
		/* On hover of map, show opacity controls */
		.js-map:hover .js-map-btns {
			display: block;
		}

		/* Custom css for settings page, duplicates preexisting settings pane grid */
		.uimod-settings {
			display: grid;
			grid-template-columns: 2fr 3fr;
			grid-gap: 8px;
			align-items: center;
			max-height: 390px;
			margin: 0 20px;
			overflow-y: auto;
		}
		/* Friends list CSS, similar to settings but supports 4 columns */
		.uimod-friends {
			display: grid;
			grid-template-columns: 2fr 1.1fr 1.5fr 0.33fr 3fr;
			grid-gap: 8px;
			align-items: center;
			max-height: 390px;
			margin: 0 20px;
			overflow-y: auto;
		}
		/* Our custom window, closely mirrors main settings window */
		.uimod-custom-window {
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
		/* Custom chat tabs */
		.uimod-chat-tabs {
			position: fixed;
			margin-top: -22px;
			left: 5px;
			pointer-events: all;
			color: #5b858e;
			font-size: 12px;
			font-weight: bold;
		}
		.uimod-chat-tabs > div {
			cursor: pointer;
			background-color: rgba(0,0,0,0.4);
			border-top-right-radius: 4px;
			border-top-left-radius: 4px;
			display: inline-block;
			border: 1px black solid;
			border-bottom: 0;
			margin-right: 2px;
			padding: 3px 5px;
		}
		.uimod-chat-tabs > div:not(.js-selected-tab):hover {
			border-color: #aaa;
		}
		.uimod-chat-tabs > .js-selected-tab {
			color: #fff;
		}

		/* Chat tab custom config */
		.uimod-chat-tab-config {
			position: absolute;
			z-index: 9999999;
		    background-color: rgba(0,0,0,0.6);
		    color: white;
		    border-radius: 3px;
		    text-align: center;
		    padding: 8px 12px 8px 6px;
		    width: 175px;
		    font-size: 14px;
		    border: 1px solid black;
		    display: none;
		}

		.uimod-chat-tab-config-grid {
			grid-template-columns: 35% 65%;
		    display: grid;
		    grid-gap: 6px;
		    align-items: center;
		}

		.uimod-chat-tab-config h1 {
			font-size: 16px;
			margin-top: 0;
		}

		.uimod-chat-tab-config .btn,
		.uimod-chat-tab-config input {
			font-size: 12px;
        }
	`);


    const modHelpers = {
        // Automated chat command helpers
        // (We've been OK'd to do these by the dev - all automation like this should receive approval from the dev)
        whisperPlayer: playerName => {
            enterTextIntoChat(`/whisper ${tempState.chatName} `);
        },
        partyPlayer: playerName => {
            enterTextIntoChat(`/partyinvite ${tempState.chatName}`);
            submitChat();
        },

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
            // Right before we show the context menu, we want to handle showing/hiding Friend/Unfriend
            const $contextMenu = document.querySelector('.js-chat-context-menu');
            $contextMenu.querySelector('[name="friend"]').classList.toggle('js-hidden', !!state.friendsList[name]);
            $contextMenu.querySelector('[name="unfriend"]').classList.toggle('js-hidden', !state.friendsList[name]);

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
            $contextMenu.style.display = 'none';
        },

        friendPlayer: playerName => {
            if (state.friendsList[playerName]) {
                return;
            }

            state.friendsList[playerName] = true;
            modHelpers.addChatMessage(`${playerName} has been added to your friends list.`);
            save();
        },

        unfriendPlayer: playerName => {
            if (!state.friendsList[playerName]) {
                return;
            }

            delete state.friendsList[playerName];
            delete state.friendNotes[playerName];
            modHelpers.addChatMessage(`${playerName} is no longer on your friends list.`);
            save();
        },

        // Adds player to block list, to be filtered out of chat
        blockPlayer: playerName => {
            if (state.blockList[playerName]) {
                return;
            }

            state.blockList[playerName] = true;
            modHelpers.filterAllChat();
            modHelpers.addChatMessage(`${playerName} has been blocked.`)
            save();
        },

        // Removes player from block list and makes their messages visible again
        unblockPlayer: playerName => {
            delete state.blockList[playerName];
            modHelpers.addChatMessage(`${playerName} has been unblocked.`);
            save();

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
                content: newMessageHTML
            });
            document.querySelector('#chat').appendChild(element);
        },

        // Gets current chat filters as represented in the UI
        // filter being true means it's invisible(filtered) in chat
        // filter being false means it's visible(unfiltered) in chat
        getCurrentChatFilters: () => {
            // Saved by the official game client
            const gameFilters = JSON.parse(localStorage.getItem('filteredChannels'));
            return {
                global: gameFilters.includes('global'),
                faction: gameFilters.includes('faction'),
                party: gameFilters.includes('party'),
                clan: gameFilters.includes('clan'),
                pvp: gameFilters.includes('pvp'),
                inv: gameFilters.includes('inv'),
                GM: !state.chat.GM, // state.chat.GM is whether or not GM chat is shown - we want whether or not GM chat should be hidden
            };
        },

        // Shows the chat tab config window for a specific tab, displayed in a specific position
        showChatTabConfigWindow: (tabId, pos) => {
            const $chatTabConfig = document.querySelector('.js-chat-tab-config');
            const chatTab = state.chatTabs.find(tab => tab.id === tabId);
            // Update position and name in chat tab config
            $chatTabConfig.style.left = `${pos.x}px`;
            $chatTabConfig.style.top = `${pos.y}px`;
            $chatTabConfig.querySelector('.js-chat-tab-name').value = chatTab.name;

            // Store tabId in state, to be used by the Remove/Add buttons in config window
            tempState.editedChatTabId = tabId;

            // Hide remove button if only one chat tab left - can't remove last one
            // Show it if more than one chat tab left
            const chatTabCount = Object.keys(state.chatTabs).length;
            const $removeChatTabBtn = $chatTabConfig.querySelector('.js-remove-chat-tab');
            $removeChatTabBtn.style.display = chatTabCount < 2 ? 'none' : 'block';

            // Show chat tab config
            $chatTabConfig.style.display = 'block';
        },

        // Adds chat tab to DOM, sets it as selected
        // If argument chatTab is provided, will use that name+id
        // If no argument is provided, will create new tab name/id and add it to state
        // isInittingTab is optional boolean, if `true`, will _not_ set added tab as selected. Used when initializing all chat tabs on load
        // Returns newly added tabId
        addChatTab: (chatTab, isInittingTab) => {
            let tabName = DEFAULT_CHAT_TAB_NAME;
            let tabId = uuid();
            if (chatTab) {
                tabName = chatTab.name;
                tabId = chatTab.id;
            } else {
                // If no chat tab was provided, create it in state
                state.chatTabs.push({
                    name: tabName,
                    id: tabId,
                    filters: modHelpers.getCurrentChatFilters(),
                });
                save();
            }

            const $tabs = document.querySelector('.js-chat-tabs');
            const $tab = makeElement({
                element: 'div',
                content: tabName,
            });
            $tab.setAttribute('data-tab-id', tabId);

            // Add chat tab to DOM
            $tabs.appendChild($tab);

            // Wire chat tab up to open config on right click
            $tab.addEventListener('contextmenu', clickEvent => {
                const mousePos = { x: clickEvent.pageX, y: clickEvent.pageY };
                modHelpers.showChatTabConfigWindow(tabId, mousePos);
            });
            // And select chat tab on left click
            $tab.addEventListener('click', () => {
                modHelpers.selectChatTab(tabId);
            });

            if (!isInittingTab) {
                // Select the newly added chat tab
                modHelpers.selectChatTab(tabId);
            }

            // Returning tabId to all adding new tab to pass tab ID to `showChatTabConfigWindow`
            return tabId;
        },

        // Selects chat tab [on click], updating client chat filters and custom chat filters
        selectChatTab: tabId => {
            // Remove selected class from everything, then add selected class to clicked tab
            Array.from(document.querySelectorAll('[data-tab-id]')).forEach($tab => {
                $tab.classList.remove('js-selected-tab');
            });
            const $tab = document.querySelector(`[data-tab-id="${tabId}"]`);
            $tab.classList.add('js-selected-tab');

            const tabFilters = state.chatTabs.find(tab => tab.id === tabId).filters;
            // Simulating clicks on the filters to turn them on/off
            const $filterButtons = Array.from(document.querySelectorAll('.channelselect small'));
            Object.keys(tabFilters).forEach(filter => {
                const $filterButton = $filterButtons.find($btn => $btn.textContent === filter);
                const isCurrentlyFiltered = $filterButton.classList.contains('textgrey');

                // If is currently filtered but filter for this tab is turned off, click it to turn filter off
                if (isCurrentlyFiltered && !tabFilters[filter]) {
                    $filterButton.click();
                }
                // If it is not currently filtered but filter for this tab is turned on, click it to turn filter on
                if (!isCurrentlyFiltered && tabFilters[filter]) {
                    $filterButton.click();
                }
            });

            // Update state for our custom chat filters to match the tab's configuration, then filter chat for it
            const isGMChatVisible = !tabFilters.GM;
            modHelpers.setGMChatVisibility(isGMChatVisible);

            // Update the selected tab in state
            state.selectedChatTabId = tabId;
            save();
        },

        // Updates state.chat.GM and the DOM to make text white/grey depending on if gm chat is visible/filtered
        // Then filters chat and saves updated chat state
        setGMChatVisibility: isGMChatVisible => {
            const $chatGM = document.querySelector(`.js-chat-gm`);
            state.chat.GM = isGMChatVisible;
            $chatGM.classList.toggle('textgrey', !state.chat.GM);
            modHelpers.filterAllChat();
            save();
        },


        /** get current xp */
        getCurrentXp: () => Number(document.querySelector('#expbar > .bar > .progressBar > .left').textContent.split('/')[0].trim()),

        /** get next level xp */
        getNextLevelXp: () => Number(document.querySelector('#expbar > .bar > .progressBar > .left').textContent.split('/')[1].trim()),

        /** user invoked reset of xp meter stats */
        resetXpMeterState: () => {
            state.xpMeterState.xpArr = [];
            state.xpMeterState.averageXp = 0;
            state.xpMeterState.gainedXp = 0;
            document.querySelector('#timeremain').textContent = '-:-:-'
        },

        /** toggle the xp meter */
        toggleXpMeter: () => {
            const xpMeterContainer = document.querySelector('#xpmeter')
            xpMeterContainer.style.display === "none" ? xpMeterContainer.style.display = "block" : xpMeterContainer.style.display = "none";
        },

        msToString: (ms) => {
            const pad = value => (value < 10 ? `0${value}` : value);
            const hours = pad(Math.floor((ms / (1000 * 60 * 60)) % 60));
            const minutes = pad(Math.floor((ms / (1000 * 60)) % 60));
            const seconds = pad(Math.floor((ms / 1000) % 60));
            return `${hours}:${minutes}:${seconds}`;
        }

    };

    // MAIN MODS BELOW
    const mods = [
        // Creates DOM elements for custom chat filters
        function newChatFilters() {
            const $channelselect = document.querySelector('.channelselect');
            if (!document.querySelector(`.js-chat-gm`)) {
                const $gm = makeElement({
                    element: 'small',
                    class: `btn border black js-chat-gm ${state.chat.GM ? '' : 'textgrey'}`,
                    content: 'GM'
                });
                $channelselect.appendChild($gm);
            }
        },

        // Creates DOM elements and wires them up for custom chat tabs and chat tab config
        // Note: Should be done after creating new custom chat filters
        function customChatTabs() {
            // Create the chat tab configuration DOM
            const $chatTabConfigurator = makeElement({
                element: 'div',
                class: 'uimod-chat-tab-config js-chat-tab-config',
                content: `
    				<h1>Chat Tab Config</h1>
    				<div class="uimod-chat-tab-config-grid">
	    				<div>Name</div><input type="text" class="js-chat-tab-name" value="untitled"></input>
	    				<div class="btn orange js-remove-chat-tab">Remove</div><div class="btn blue js-save-chat-tab">Ok</div>
	    			</div>
    			`,
            });
            document.body.append($chatTabConfigurator);

            // Wire it up
            document.querySelector('.js-remove-chat-tab').addEventListener('click', () => {
                // Remove the chat tab from state
                const editedChatTab = state.chatTabs.find(tab => tab.id === tempState.editedChatTabId);
                const editedChatTabIndex = state.chatTabs.indexOf(editedChatTab);
                state.chatTabs.splice(editedChatTabIndex, 1);

                // Remove the chat tab from DOM
                const $chatTab = document.querySelector(`[data-tab-id="${tempState.editedChatTabId}"]`);
                $chatTab.parentNode.removeChild($chatTab);

                // If we just removed the currently selected chat tab
                if (tempState.editedChatTabId === state.selectedChatTabId) {
                    // Select the chat tab to the left of the removed one
                    const nextChatTabIndex = editedChatTabIndex === 0 ? 0 : editedChatTabIndex - 1;
                    modHelpers.selectChatTab(state.chatTabs[nextChatTabIndex].id);
                }

                // Close chat tab config
                document.querySelector('.js-chat-tab-config').style.display = 'none';
            });

            document.querySelector('.js-save-chat-tab').addEventListener('click', () => {
                // Set new chat tab name in DOM
                const $chatTab = document.querySelector(`[data-tab-id="${state.selectedChatTabId}"]`);
                const newName = document.querySelector('.js-chat-tab-name').value;
                $chatTab.textContent = newName;

                // Set new chat tab name in state
                // `selectedChatTab` is a reference on `state.chatTabs`, so updating it above still updates it in the state - we want to save that
                const selectedChatTab = state.chatTabs.find(tab => tab.id === state.selectedChatTabId);
                selectedChatTab.name = newName;
                save();

                // Close chat tab config
                document.querySelector('.js-chat-tab-config').style.display = 'none';
            });

            // Create the initial chat tabs HTML
            const $chat = document.querySelector('#chat');
            const $chatTabs = makeElement({
                element: 'div',
                class: 'uimod-chat-tabs js-chat-tabs',
                content: '<div class="js-chat-tab-add">+</div>',
            });

            // Add them to the DOM
            $chat.parentNode.insertBefore($chatTabs, $chat);

            // Add all our chat tabs from state
            state.chatTabs.forEach(chatTab => {
                const isInittingTab = true;
                modHelpers.addChatTab(chatTab, isInittingTab);
            });

            // Wire up the add chat tab button
            document.querySelector('.js-chat-tab-add').addEventListener('click', clickEvent => {
                const chatTabId = modHelpers.addChatTab();
                const mousePos = { x: clickEvent.pageX, y: clickEvent.pageY };
                modHelpers.showChatTabConfigWindow(chatTabId, mousePos);
            });

            // If initial chat tab doesn't exist, create it based off current filter settings
            if (!Object.keys(state.chatTabs).length) {
                const tabId = uuid();
                const chatTab = {
                    name: 'Main',
                    id: tabId,
                    filters: modHelpers.getCurrentChatFilters()
                };
                state.chatTabs.push(chatTab);
                save();
                modHelpers.addChatTab(chatTab);
            }

            // Wire up click event handlers onto the filters to update the selected chat tab's filters in state
            document.querySelector('.channelselect').addEventListener('click', clickEvent => {
                const $elementMouseIsOver = document.elementFromPoint(clickEvent.clientX, clickEvent.clientY);

                // We only want to change the filters if the user manually clicks the filter button
                // If they clicked a chat tab and we programatically set filters, we don't want to update
                // the current tab's filter state
                if (!$elementMouseIsOver.classList.contains('btn')) {
                    return;
                }
                const selectedChatTab = state.chatTabs.find(tab => tab.id === state.selectedChatTabId);
                selectedChatTab.filters = modHelpers.getCurrentChatFilters();
                save();
            });

            // Select the currently selected tab in state on mod initialization
            if (state.selectedChatTabId) {
                modHelpers.selectChatTab(state.selectedChatTabId);
            }
        },

        // Wire up new chat buttons to toggle in state+ui
        function newChatFilterButtons() {
            const $chatGM = document.querySelector(`.js-chat-gm`);
            $chatGM.addEventListener('click', () => {
                modHelpers.setGMChatVisibility(!state.chat.GM);
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
                    save();
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
                state.chatWidth = chatWidthStr;
                state.chatHeight = chatHeightStr;
                save();
            });
            resizeObserverChat.observe($chatContainer);
        },

        // Makes map resizable
        function resizeableMap() {
            const $map = document.querySelector('.container canvas').parentNode;
            const $canvas = $map.querySelector('canvas');
            $map.classList.add('js-map-resize');

            // Track whether we're clicking (resizing) map or not
            // Used to detect if resize changes are manually done, or from minimizing/maximizing map (with [M])
            $map.addEventListener('mousedown', () => {
                tempState.clickingMap = true;
            });
            // Sometimes the mouseup event may be registered outside of the map - we account for this
            document.body.addEventListener('mouseup', () => {
                tempState.clickingMap = false;
            });

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

                // If we're clicking map, i.e. manually resizing, then save state
                // Don't save state when minimizing/maximizing map via [M]
                if (tempState.clickingMap) {
                    state.mapWidth = mapWidthStr;
                    state.mapHeight = mapHeightStr;
                    save();
                } else {
                    const isMaximized = mapWidth > tempState.lastMapWidth && mapHeight > tempState.lastMapHeight;
                    if (!isMaximized) {
                        $map.style.width = state.mapWidth;
                        $map.style.height = state.mapHeight;
                    }
                }

                // Store last map width/height in temp state, so we know if we've minimized or maximized
                tempState.lastMapWidth = mapWidth;
                tempState.lastMapHeight = mapHeight;
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
            const debouncedTriggerResize = debounce(triggerResize, 50);
            const resizeObserverCanvas = new ResizeObserver(debouncedTriggerResize);
            resizeObserverCanvas.observe($canvas);
        },

        function mapControls() {
            const $map = document.querySelector('.container canvas');
            if (!$map.parentNode.classList.contains('js-map')) {
                $map.parentNode.classList.add('js-map');
            }
            const $mapContainer = document.querySelector('.js-map');

            // On load, update map opacity to match state
            // We modify the opacity of the canvas and the background color alpha of the parent container
            // We do this to allow our opacity buttons to be visible on hover with 100% opacity
            // (A surprisingly difficult enough task to require this implementation)
            const updateMapOpacity = () => {
                $map.style.opacity = String(state.mapOpacity / 100);
                const mapContainerBgColor = window.getComputedStyle($mapContainer, null).getPropertyValue('background-color');
                // Credit for this regexp + This opacity+rgba dual implementation: https://stackoverflow.com/questions/16065998/replacing-changing-alpha-in-rgba-javascript
                let opacity = state.mapOpacity / 100;
                // This is a slightly lazy browser workaround to fix a bug.
                // If the opacity is `1`, and it sets `rgba` to `1`, then the browser changes the
                // rgba to rgb, dropping the alpha. We could account for that and add the `alpha` back in
                // later, but setting the max opacity to very close to 1 makes sure the issue never crops up.
                // Fun fact: 0.99 retains the alpha, but setting this to 0.999 still causes the browser to drop the alpha. Rude.
                if (opacity === 1) {
                    opacity = 0.99;
                }
                const newBgColor = mapContainerBgColor.replace(/[\d\.]+\)$/g, `${opacity})`);
                $mapContainer.style['background-color'] = newBgColor;

                // Update the button opacity
                const $addBtn = document.querySelector('.js-map-opacity-add');
                const $minusBtn = document.querySelector('.js-map-opacity-minus');
                // Hide plus button if the opacity is max
                if (state.mapOpacity === 100) {
                    $addBtn.style.visibility = 'hidden';
                } else {
                    $addBtn.style.visibility = 'visible';
                }
                // Hide minus button if the opacity is lowest
                if (state.mapOpacity === 0) {
                    $minusBtn.style.visibility = 'hidden';
                } else {
                    $minusBtn.style.visibility = 'visible';
                }
            };

            const $mapButtons = makeElement({
                element: 'div',
                class: 'js-map-btns',
                content: `
    				<button class="js-map-opacity-add">+</button>
    				<button class="js-map-opacity-minus">-</button>
    				<button class="js-map-reset">r</button>
				`,
            });

            // Add it right before the map container div
            $map.parentNode.insertBefore($mapButtons, $map);

            const $addBtn = document.querySelector('.js-map-opacity-add');
            const $minusBtn = document.querySelector('.js-map-opacity-minus');
            const $resetBtn = document.querySelector('.js-map-reset');
            // Hide the buttons if map opacity is maxed/minimum
            if (state.mapOpacity === 100) {
                $addBtn.style.visibility = 'hidden';
            }
            if (state.mapOpacity === 0) {
                $minusBtn.style.visibility = 'hidden';
            }

            // Wire it up
            $addBtn.addEventListener('click', clickEvent => {
                // Update opacity
                state.mapOpacity += 10;
                save();
                updateMapOpacity();
            });

            $minusBtn.addEventListener('click', clickEvent => {
                // Update opacity
                state.mapOpacity -= 10;
                save();
                updateMapOpacity();
            });

            $resetBtn.addEventListener('click', clickEvent => {
                state.mapOpacity = 70;
                state.mapWidth = '174px';
                state.mapHeight = '174px';
                save();
                updateMapOpacity();
                $mapContainer.style.width = state.mapWidth;
                $mapContainer.style.height = state.mapHeight;
            });

            updateMapOpacity();
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

        // The F icon and the UI that appears when you click it
        function customFriendsList() {
            var friendsIconElement = makeElement({
                element: 'div',
                class: 'btn border black js-friends-list-icon',
                content: 'F',
            });
            // Add the icon to the right of Elixir icon
            const $elixirIcon = document.querySelector('#sysgem');
            $elixirIcon.parentNode.insertBefore(friendsIconElement, $elixirIcon.nextSibling);

            // Create the friends list UI
            document.querySelector('.js-friends-list-icon').addEventListener('click', () => {
                if (document.querySelector('.js-friends-list')) {
                    // Don't open the friends list twice.
                    return;
                }
                let friendsListHTML = '';
                Object.keys(state.friendsList).sort().forEach(friendName => {
                    friendsListHTML += `
    					<div data-player-name="${friendName}">${friendName}</div>
    					<div class="btn blue js-whisper-player" data-player-name="${friendName}">Whisper</div>
    					<div class="btn blue js-party-player" data-player-name="${friendName}">Party invite</div>
    					<div class="btn orange js-unfriend-player" data-player-name="${friendName}">X</div>
						<input type="text" class="js-friend-note" data-player-name="${friendName}" value="${state.friendNotes[friendName] || ''}"></input>
					`;
                });

                const customFriendsWindowHTML = `
    				<h3 class="textprimary">Friends list</h3>
    				<div class="uimod-friends">${friendsListHTML}</div>
    				<p></p>
    				<div class="btn purp js-close-custom-friends-list">Close</div>
    			`;

                const $customFriendsList = makeElement({
                    element: 'div',
                    class: 'menu panel-black js-friends-list uimod-custom-window',
                    content: customFriendsWindowHTML,
                });
                document.body.appendChild($customFriendsList);

                // Wire up the buttons
                Array.from(document.querySelectorAll('.js-whisper-player')).forEach($button => {
                    $button.addEventListener('click', clickEvent => {
                        const name = clickEvent.target.getAttribute('data-player-name');
                        modHelpers.whisperPlayer(name);
                    });
                });
                Array.from(document.querySelectorAll('.js-party-player')).forEach($button => {
                    $button.addEventListener('click', clickEvent => {
                        const name = clickEvent.target.getAttribute('data-player-name');
                        modHelpers.partyPlayer(name);
                    });
                });
                Array.from(document.querySelectorAll('.js-unfriend-player')).forEach($button => {
                    $button.addEventListener('click', clickEvent => {
                        const name = clickEvent.target.getAttribute('data-player-name');
                        modHelpers.unfriendPlayer(name);

                        // Remove the blocked player from the list
                        Array.from(document.querySelectorAll(`.js-friends-list [data-player-name="${name}"]`)).forEach($element => {
                            $element.parentNode.removeChild($element);
                        });
                    });
                });
                Array.from(document.querySelectorAll('.js-friend-note')).forEach($element => {
                    $element.addEventListener('change', clickEvent => {
                        const name = clickEvent.target.getAttribute('data-player-name');
                        state.friendNotes[name] = clickEvent.target.value;
                    });
                })

                // The close button for our custom UI
                document.querySelector('.js-close-custom-friends-list').addEventListener('click', () => {
                    const $friendsListWindow = document.querySelector('.js-friends-list');
                    $friendsListWindow.parentNode.removeChild($friendsListWindow);
                });
            });
        },

        // Custom settings UI, currently just Blocked players
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
    				<div class="btn purp js-close-custom-settings">Close</div>
    			`;

                const $customSettings = makeElement({
                    element: 'div',
                    class: 'menu panel-black js-custom-settings uimod-custom-window',
                    content: customSettingsHTML,
                });
                document.body.appendChild($customSettings);

                // Wire up all the unblock buttons
                Array.from(document.querySelectorAll('.js-unblock-player')).forEach($button => {
                    $button.addEventListener('click', clickEvent => {
                        const name = clickEvent.target.getAttribute('data-player-name');
                        modHelpers.unblockPlayer(name);

                        // Remove the blocked player from the list
                        Array.from(document.querySelectorAll(`.js-custom-settings [data-player-name="${name}"]`)).forEach($element => {
                            $element.parentNode.removeChild($element);
                        });
                    });
                });
                // And the close button for our custom UI
                document.querySelector('.js-close-custom-settings').addEventListener('click', () => {
                    const $customSettingsWindow = document.querySelector('.js-custom-settings');
                    $customSettingsWindow.parentNode.removeChild($customSettingsWindow);
                });
            });
        },

        // This creates the initial chat context menu DOM (which starts as hidden)
        function createChatContextMenu() {
            if (document.querySelector('.js-chat-context-menu')) {
                return;
            }

            let contextMenuHTML = `
    			<div class="js-name">...</div>
				<div class="choice" name="party">Party invite</div>
				<div class="choice" name="whisper">Whisper</div>
				<div class="choice" name="friend">Friend</div>
				<div class="choice" name="unfriend">Unfriend</div>
				<div class="choice" name="block">Block</div>
			`
            document.body.appendChild(makeElement({
                element: 'div',
                class: 'panel context border grey js-chat-context-menu',
                content: contextMenuHTML,
            }));

            const $chatContextMenu = document.querySelector('.js-chat-context-menu');
            $chatContextMenu.querySelector('[name="party"]').addEventListener('click', () => {
                modHelpers.partyPlayer(tempState.chatName);
            });
            $chatContextMenu.querySelector('[name="whisper"]').addEventListener('click', () => {
                modHelpers.whisperPlayer(tempState.chatName);
            });
            $chatContextMenu.querySelector('[name="friend"]').addEventListener('click', () => {
                modHelpers.friendPlayer(tempState.chatName);
            });
            $chatContextMenu.querySelector('[name="unfriend"]').addEventListener('click', () => {
                modHelpers.unfriendPlayer(tempState.chatName);
            });
            $chatContextMenu.querySelector('[name="block"]').addEventListener('click', () => {
                modHelpers.blockPlayer(tempState.chatName);
            });
        },

        // This opens a context menu when you click a user's name in chat
        function chatContextMenu() {
            const addContextMenu = ($name, name) => {
                $name.classList.add('js-is-context-menu-initd');
                // Add name to element so we can target it in CSS when filtering chat for block list
                $name.setAttribute('data-chat-name', name);

                const showContextMenu = clickEvent => {
                    // TODO: Is there a way to pass the name to showChatContextMenumethod, instead of storing in tempState?
                    tempState.chatName = name;
                    modHelpers.showChatContextMenu(name, { x: clickEvent.pageX, y: clickEvent.pageY });
                };
                $name.addEventListener('click', showContextMenu); // Left click
                $name.addEventListener('contextmenu', showContextMenu); // Right click works too
            };
            Array.from(document.querySelectorAll('.name:not(.js-is-context-menu-initd)')).forEach(($name) => {
                addContextMenu($name, $name.textContent);
            });
            Array.from(document.querySelectorAll('.textwhisper .textf1:not(.js-is-context-menu-initd)')).forEach($whisperName => {
                // $whisperName's textContent is "to [name]" or "from [name]", so we cut off the first word
                let name = $whisperName.textContent.split(' ');
                name.shift(); // Remove the first word
                name = name.join(' ');
                addContextMenu($whisperName, name);
            });
        },

        function xpMeter() {
            /** elements  */
            const $layoutContainer = document.querySelector('body > div.layout > div.container:nth-child(1)');

            /** dps meter toggle */
            const $dpsMeterToggleElement = document.querySelector('#systrophy');

            /** $xpMeterToggleElement */
            const $xpMeterToggleElement = document.createElement('div');
            $xpMeterToggleElement.id = "sysxp";
            $xpMeterToggleElement.className = "btn border black";
            $xpMeterToggleElement.innerHTML = `XP`;

            /** xpMeterElement */
            const xpMeterHTMLString = `<div class="l-corner-lr container svelte-rhzpkh" id="xpmeter" style="display: none">\
            <div class="window panel-black svelte-1rw636">\
                <div class="titleframe svelte-1rw636">\
                    <img src="/assets/ui/icons/trophy.svg?v=3282286" class="titleicon svgicon svelte-1rw636">\
                        <div class="textprimary title svelte-1rw636">\
                            <div name="title">Experience / XPS</div>\
                        </div>\
                        <img src="/assets/ui/icons/cross.svg?v=3282286" class="btn black svgicon">\
                </div>\
                <div class="slot svelte-1rw636" style="">\
                    <div class="wrapper svelte-rhzpkh">
                        <div class="bar  svelte-kl29tr" style="z-index: 0;">
                            <div class="progressBar bgc1 svelte-kl29tr" style="width: 100%; font-size: 1em;">
                                <span class="left svelte-kl29tr">XP per Second:</span>
                                <span class="right svelte-kl29tr" id="xps">-</span>
                            </div>
                            <div class="progressBar bgc1 svelte-kl29tr" style="width: 100%; font-size: 1em;">
                                <span class="left svelte-kl29tr">XP per minute:</span>
                                <span class="right svelte-kl29tr" id="xpm">-</span>
                            </div>
                            <div class="progressBar bgc1 svelte-kl29tr" style="width: 100%; font-size: 1em;">
                                <span class="left svelte-kl29tr">XP per hour:</span>
                                <span class="right svelte-kl29tr" id="xph">-</span>
                            </div>
                            <div class="progressBar bgc1 svelte-kl29tr" style="width: 100%; font-size: 1em;">
                                <span class="left svelte-kl29tr">XP Gained:</span>
                                <span class="right svelte-kl29tr" id="xpGained">-</span>
                            </div>                 
                            <div class="progressBar bgc1 svelte-kl29tr" style="width: 100%; font-size: 1em;">
                                <span class="left svelte-kl29tr">XP Left:</span>
                                <span class="right svelte-kl29tr" id="xpl">-</span>
                            </div>
                            <div class="progressBar bgc1 svelte-kl29tr" style="width: 100%; font-size: 1em;">
                            <span class="left svelte-kl29tr">Time to lvl: </span>
                            <span class="right svelte-kl29tr" id="timeremain">-</span>
                        </div>
                        </div>
                    </div>\
                    <div class="grid two buttons marg-top svelte-rhzpkh">\
                        <div class="btn grey">Reset</div>\
                    </div>\
                </div>\
            </div>\
        </div>`;

            $dpsMeterToggleElement.parentNode.insertBefore($xpMeterToggleElement, $dpsMeterToggleElement.nextSibling);

            const $xpMeterElement = document.createElement('div');
            $xpMeterElement.innerHTML = xpMeterHTMLString.trim();
            $layoutContainer.appendChild($xpMeterElement.firstChild);

            document.querySelector('#sysxp').addEventListener('click', modHelpers.toggleXpMeter);
            document.querySelector('#xpmeter > div > div.titleframe > img.btn.black.svgicon').addEventListener('click', modHelpers.toggleXpMeter);
            document.querySelector('#xpmeter > div > div.slot > div.grid.two.buttons.marg-top > div.btn').addEventListener('click', modHelpers.resetXpMeterState);

            state.xpMeterState.currentXp = modHelpers.getCurrentXp();

            if (tempState.xpMeterInterval) clearInterval(tempState.xpMeterInterval)

            tempState.xpMeterInterval = setInterval(() => {
                state.xpMeterState.gainedXp += modHelpers.getCurrentXp() - state.xpMeterState.currentXp;
                state.xpMeterState.xpArr.push(modHelpers.getCurrentXp() - state.xpMeterState.currentXp);
                state.xpMeterState.currentXp = modHelpers.getCurrentXp();
                state.xpMeterState.averageXp = state.xpMeterState.xpArr.reduce((a, b) => a + b) / state.xpMeterState.xpArr.length;

                document.querySelector('#xps').textContent = parseInt(state.xpMeterState.averageXp.toFixed(0)).toLocaleString();
                document.querySelector('#xpm').textContent = parseInt((state.xpMeterState.averageXp * 60).toFixed(0)).toLocaleString();
                document.querySelector('#xph').textContent = parseInt((state.xpMeterState.averageXp * 60 * 60).toFixed(0)).toLocaleString();
                document.querySelector('#xpGained').textContent = state.xpMeterState.gainedXp.toLocaleString();
                document.querySelector('#xpl').textContent = (modHelpers.getNextLevelXp() - modHelpers.getCurrentXp()).toLocaleString();
                if (state.xpMeterState.averageXp > 0) {
                    document.querySelector('#timeremain').textContent = modHelpers.msToString((modHelpers.getNextLevelXp() - modHelpers.getCurrentXp()) / state.xpMeterState.averageXp * 1000);
                }
                console.log(state.xpMeterState);
            }, 1000);
        }
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
    function save(items) {
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
        let offset = [0, 0];
        let isDown = false;
        $dragTrigger.addEventListener('mousedown', function (e) {
            isDown = true;
            offset = [
                $draggedElement.offsetLeft - e.clientX,
                $draggedElement.offsetTop - e.clientY
            ];
        }, true);
        document.addEventListener('mouseup', function () {
            isDown = false;
        }, true);

        document.addEventListener('mousemove', function (e) {
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
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Credit: https://gist.github.com/jcxplorer/823878
    // Generate random UUID string
    function uuid() {
        var uuid = "", i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i == 8 || i == 12 || i == 16 || i == 20) {
                uuid += "-";
            }
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }
})();
