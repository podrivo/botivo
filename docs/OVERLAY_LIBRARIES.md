# Overlay libraries (Anime.js, Splitting & Fitty)

The overlay uses **Anime.js**, **Splitting.js**, and **Fitty** for animations, text effects, and fitting. This doc lists their default options and how Botivo uses them.

## Anime.js

Anime.js is a lightweight JavaScript animation library. It animates DOM elements (and more) with a simple API. The overlay loads the UMD bundle from [overlay/js/plugins/anime.min.js](overlay/js/plugins/anime.min.js) and exposes `window.anime`.

### Main API

Use **`anime.animate(target, options)`** to run an animation. `target` can be a single element, a NodeList, or a selector string. The function returns an animation object with methods such as `.play()`, `.pause()`, `.restart()`, `.resume()`, and **`.reset()`** (stops the animation and reverts to the starting state).

### Common options

| Option       | Description |
|--------------|-------------|
| `duration`   | Duration in milliseconds |
| `ease`       | Easing (e.g. `'linear'`, `'outExpo'`) |
| `opacity`    | Value or `[from, to]` array |
| `translateX`, `translateY` | Transform values |
| `marginTop`, etc. | CSS properties (camelCase) |
| `autoplay`   | `true` (default) or `false`; if `false`, call `.restart()` and `.resume()` to start |
| `onComplete` | Callback when the animation finishes |

### How Botivo uses it

Command overlay scripts (e.g. [commands/example/overlay.js](commands/example/overlay.js), [commands/train/overlay.js](commands/train/overlay.js)) call `anime.animate(element, { ... })` to animate elements. The main overlay ([overlay/js/main.js](overlay/js/main.js)) **wraps** `anime.animate` so that every created animation is pushed to `window.__animeKillRestartList`. When the **!kill** event is received, the overlay iterates that list, calls `.reset()` on each animation, then uses `anime.cleanInlineStyles(anim)` so elements don’t keep inline opacity/transform/margin. It also removes common Anime.js inline properties (`opacity`, `margin-top`, `transform`) from all nodes in the commands container. So any animation started via `anime.animate` is automatically stopped and cleaned up on !kill.

### Reference

[Anime.js](https://animejs.com/)

---

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

The main overlay ([overlay/js/main.js](overlay/js/main.js)) runs Fitty **after** each command's HTML is injected. It only targets that command's container, in the same way as Splitting:

```js
const fittyTargets = container.querySelectorAll('[data-fitty]')
if (window.fitty && fittyTargets.length) fittyTargets.forEach(el => fitty(el, { maxSize: 999 }))
```

So only nodes with the `[data-fitty]` attribute inside the newly injected HTML get Fitty applied. Use it in your command HTML when text should fit the container, e.g. `<span data-fitty>BRB</span>`. The `maxSize: 999` option lets large overlay headlines scale. Commands such as brb, wow, and nice use `data-fitty` in their HTML and no longer call `fitty()` in overlay.js.

### Return value and methods

`fitty(selector)` returns a single Fitty instance or an array of instances (when the selector matches multiple elements). Each instance has methods such as `fit(options)` (force redraw), `freeze()`, `unfreeze()`, and `unsubscribe()` to stop updates and restore the element.

### Reference

[Fitty on GitHub](https://github.com/rikschennink/fitty)
