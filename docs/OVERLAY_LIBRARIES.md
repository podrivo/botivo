# Overlay libraries (Splitting & Fitty)

The overlay uses **Splitting.js** and **Fitty** for text effects and fitting. This doc lists their default options and how Botivo uses them.

## Splitting.js

Splitting.js splits text (or other content) into elements (characters, words, lines, etc.) and sets CSS variables on those elements so you can animate them with CSS or JavaScript. The library does not handle animation itself.

### Default options

| Option   | Default             | Description |
|----------|---------------------|-------------|
| `target` | `"[data-splitting]"` | CSS selector, Element, or NodeList of elements to split |
| `by`     | `"chars"`           | Plugin name: how to split. If not set, the element's `data-splitting` attribute is used; if that is missing, `chars` is used |
| `key`    | `null`              | Optional prefix for CSS variables (e.g. `"hero"` → `--hero-char-index`) |

### How Botivo uses it

The main overlay ([overlay/js/main.js](overlay/js/main.js)) runs Splitting **after** each command's HTML is injected. It only targets that command's container:

```js
const splittingTargets = container.querySelectorAll('[data-splitting]')
if (window.Splitting && splittingTargets.length) Splitting({ target: splittingTargets })
```

So only nodes with `[data-splitting]` inside the newly injected HTML are split. The `by` option is not passed; each element uses its own `data-splitting` value (e.g. `data-splitting="words"`) or defaults to **chars**.

### Plugins

Available split types: **chars** (default), **words**, **lines**, **items**, **grid**, **cols**, **rows**, **cells**. The `chars` plugin depends on `words` (it splits by words first, then by characters). In your command HTML you can set `data-splitting` to choose the plugin, e.g. `<span data-splitting>NICE</span>` (chars) or `data-splitting="words"` for word-level splits.

### CSS

The overlay imports [overlay/css/splitting.css](overlay/css/splitting.css) and [overlay/css/splitting-cells.css](overlay/css/splitting-cells.css). The main stylesheet adds CSS variables such as `--char-index`, `--char-total`, `--word-index`, `--word-total`, and classes like `.char` and `.word` so you can style or animate each unit.

### Reference

[Splitting.js guide](https://splitting.js.org/guide.html)

---

## Fitty

Fitty resizes text so it fits its parent container, within a minimum and maximum font size.

### Default options

| Option              | Default | Description |
|---------------------|---------|-------------|
| `minSize`           | `16`    | Minimum font size in pixels |
| `maxSize`           | `512`   | Maximum font size in pixels |
| `multiLine`         | `true`  | Wrap lines when at minimum font size |
| `observeMutations`  | see below | Rescale when element content changes. Uses a MutationObserver config or `false` if not supported |

Default MutationObserver config: `{ subtree: true, childList: true, characterData: true }`.

### How Botivo uses it

There is no global Fitty call. Commands that need text to fit the container call `fitty()` in their `overlay.js`, often with a higher `maxSize` so large overlay headlines can scale:

```js
fitty(element, { maxSize: 999 })
```

Examples: [commands/brb/overlay.js](commands/brb/overlay.js), [commands/wow/overlay.js](commands/wow/overlay.js), [commands/nice/overlay.js](commands/nice/overlay.js).

### Return value and methods

`fitty(selector)` returns a single Fitty instance or an array of instances (when the selector matches multiple elements). Each instance has methods such as `fit(options)` (force redraw), `freeze()`, `unfreeze()`, and `unsubscribe()` to stop updates and restore the element.

### Reference

[Fitty on GitHub](https://github.com/rikschennink/fitty)
