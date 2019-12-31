==Potential features==

-   Add whisper chat filter
-   Implement inventory sorting
-   Remove all reliance on svelte- classes, likely breaks with updates (Partially started: Added `getWindow` method to utils.game)
-   Add cooldown on skills (leverage skill icon URL, have a map for each skill icon mapping to its respective cooldown)
-   Clicking names in party to add as friends
-   Rotate map canvas with your direction
-   Move[Drag] player/target health bars, party frames
-   Tooltip on buffs to show name+basic effect [cant get level probably]
-   Proper draggable + close button for custom friends list, custom block list, and maybe chat tab config windows
-   Track gold per hour, must keep inventory open though [make sure user is aware]
-   Ctrl clicking item in inventory when Merchant is open to paste item name into search field, and search
-   Menu option on items to copy details to clipboard, for pasting in chat
-   Add keybind for friends list (Need to create custom keybind UI, accessible from Settings, disallow using same keybinds as game)
-   (MAYBE) Improved healer party frames
-   (MAYBE) Add toggleable option to include chat messages to right of party frame
-   (MAYBE) Fame/time meter
-   (MAYBE) Heals per second meter

==Bugs==

-   Some users are expierencing the minimap bugging out - constantly resetting size when they try to resize or maximize, blinking a lot
-   If any windows are dragged outside of the screen view, they become inaccessible. We should pop it back into view automatically if it's dragged too far
