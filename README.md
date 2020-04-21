# HordesUIMod

Userscript mod for hordes.io
testdonotmerge
# Installation

1. Download Tampermonkey for [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2. Go to [our Greasyfork page](https://greasyfork.org/en/scripts/394056-hordes-ui-mod) to download the userscript.
3. Install this script, then refresh hordes.io.
   That's all you need to do :).

# Contributing

Thanks so much for wanting to contribute to the Hordes userscript mod! We've built this repo to make it easy to add your own mod code without having to touch any of the preexisting code.

This repo uses ESLint and Prettier to lint and automatically format your code.
They will be run on every commit. You can also install the Prettier plugin for VS Code to format on save.

Feel free to contribute new mods, though if they're complex, it's recommended to discuss your mod idea and technical approach with the repo owner, to increase the likelihood your mod change is accepted.

# Mod structure

This repo contains multiple different mods that are all bundled into a single userscript.
If you'd like to contribute to this repo by adding a new mod, it's important you understand how individual mods are structured.
We strongly appreciate you trying to keep your code as consistent as possible with our preexisting code and mods.

Inside of `src/mods`, we have one folder per mod. If your mod needs any custom styles, you can add a `styles.scss` file that will be compiled into CSS and built into the userscript.

_Basic CSS Rules:_
You should never create new CSS IDs, only classes.
If the class is never called/toggled via javascript, and is stylistic only, please prefix the class with `uimod-`.
If the class is called/toggled via javascript, please prefix the class with `js-`.

_Getting into the Javascript:_
Your mod folder will also contain an `index.js` file that _must_ export an object following the structure:

```js
{
	name: 'Your mod name',
	description: 'Brief description of your mod',
	run: () {
		callsToYourModFunctionHere();
	}
}
```

Functions in `index.js` should all be called from the `run` method. Any other methods your `index.js` file needs to call can be added to a `helpers.js` file.

If your mod needs to make changes (call functions) whenever part of the game changes, you can register these function calls inside of your run method as follows:

```js
run: ({ registerOnDomChange, registerOnChatChange, registerOnLeftClick, registerOnRightClick }): {
    // Whenever the game DOM changes
    // Technically: MutationObserver running whenever .layout changes
    registerOnDomChange(functionCallbackHere);

    // Whenever something in chat changes
    // Technically: Mutation observer running whenever #chat changes
    registerOnChatChange(functionCallbackHere);

    // Whenever user left clicks anywhere on page
    // Technically: `click` Event listener running on document.body
    registerOnLeftClick(functionCallbackHere);

    // Whenever user right clicks anywhere on page
    // Technically: `contextmenu` Event listener running on document.body
    registerOnRightClick(functionCallbackHere);
}
```

When creating your mod, feel free to browse and use the various helper methods in `src/utils`. These utils contain helpful functions that are shared or are expected to be shared between multiple mods.

You will also need to update `src/mods/index.js`, adding your mod to the end of the exported array in this file. This ensures it is run.

## Integrating with Hordes Settings

You can add a new item to the Hordes settings list which opens a new window.
To do this, you'll want to leverage the `registerSettingsMenuItem` method from the `_customSettings/index.js` mod file. Import this method into your mod, and then call it as such:

```js
registerSettingsMenuItem({
	windowName: ui.WindowNames.x,
	handleOpenWindow: () => {},
	label: 'Text',
});
```

`windowName` is used to create class names and check if the window is open.
You must pass a property of the `WindowNames` object to this property.
`WindowNames` is exported by `ui.js`. You should import this variable and then specify your own mod's window name:

```js
WindowNames.myMod = 'my-mod';
```

`handleOpenWindow` is a callback that is triggered when the user clicks the settings item.
The window it opens must have a css class matching `js-${windowName}`
e.g. If windowName is `block-list`, the CSS class for your created window must be `js-block-list`

`label` is the text visible in the Settings menu

See an example usage of this method in the `blockList` mod.

## Integrating with the Chat Context Menu

Want to add a new chat menu item that appears when a user clicks a player's name in chat? Easy.
You'll want to import the `registerChatMenuItem` method from the `chatContextMenu/index.js` mod file, and then call it as such:

```js
registerChatMenuItem({
	id: 'id',
	label: 'label',
	handleClick: () => {},
	handleVisibilityCheck: () => {}, // Optional
});
```

`id` is unique to this chat context item, e.g. "friend"

`label` is the text in the visible context menu

`handleClick` is a callback triggered when the user clicks on the menu item

`handleVisiblityCheck` is an optional callback triggered when the menu is rendered.
Return `true` and the menu item will be visible, return `false` and it will be hidden
If this argument is not provided, the menu item will always be visible.

See an example usage of this method in the `friendsList` mod.

# Other places contributors will need to touch

Add yourself as an author - update `src/authors.js` and add your preferred name to the end of the array. It'll be included in the compiled userscript on all future versions.

# Building the userscript

If you've made custom modifications to this repo, you can run `npm run build` to build the userscript and test it locally by copypasting it into Tampermonkey.
