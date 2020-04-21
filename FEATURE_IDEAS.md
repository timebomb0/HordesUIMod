==Potential features==

-   Add whisper chat filter
-   Implement inventory sorting
-   Clicking names in party to add as friends
-   Ctrl clicking item in inventory when Merchant is open to paste item name into search field, and search
-   Alt+right click item stats should work from other windows - character at least, but ideally stash and auction
-   Locked slots should be specific to each character
-   Buff blacklists to only show certain buffs
-   Button to Lock all UI from moving
-   Shift+Right clicking on locked item should open item context menu
-   Highlight player's name in chat
-   Right clicking skill icon casts the skill
- Ability to change filter of game canvas, to shift colors for fun
-   UI Listing quantity of enemies that have targeted you or your party members in the last 10 seconds
-   (MAYBE) When comparing gear by holding shift to see the tooltip, show _real_ stat differences, i.e. calculate what wisdom/stamina/etc change.
-   (MAYBE) When comparing gear, show how different the items would be when they're at the same upgrade level
-   (MAYBE) Track gold per hour, must keep inventory open though [make sure user is aware]
-   (MAYBE) Add keybind for friends list (Need to create custom keybind UI, accessible from Settings, disallow using same keybinds as game)
-   (MAYBE) Improved healer party frames
-   (MAYBE) Add toggleable option to include chat messages to right of party frame
-   (MAYBE) Fame/time meter
-   (MAYBE) Heals per second meter

==Bugs==

-   Occasionally skill cooldowns don't display for long cooldowns when mid-combat (Like Mimir's Well)
-   Copy stats doesn't copy the `#-# damage` stat correctly
-   Resized chat doesnt save width/height sometimes
-   Skill bar can be dragged when moving around skills - this is not ideal. Should not be moved if they're dragging a skill/item.

==Technical improvements==

-   Add in new skill buffs to buff tooltips
-   Should refactor ui.js to keep UI logic inside of each mod folder, and expose certain public APIs from individual mods to other mods
-   Should create interval every 3-5s where state updates in localstorage if it has saved, then remove various setState calls
-   Remove all reliance on svelte- classes, likely breaks with updates (Partially started: Added `getWindow` method to utils.game)
-   Consider adding a new hook for onMouseMove that returns the element the mouse is currently over. Update buffTooltips (and other mods) with it as necessary
