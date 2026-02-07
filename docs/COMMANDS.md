# Commands

## Adding a new command
1. **Copy a template** — For a **chat-only** command (no overlay): copy the `commands/hello` folder. For a **chat + overlay** command: copy the `commands/example` folder.
2. **Rename the folder** — Rename it to your command name (e.g. `meme` → use `!meme` in chat).
3. **Edit the chat message** — In `command.js`, change what the bot says (e.g. `twitch.say(...)`).
4. **If you want overlay** — Edit `overlay.js` and the files in `assets/` (HTML, CSS, sounds, etc.).
5. **Optional** — In `config.js` set cooldown, permission, or alias.


## Command files
`command.js` — **Sends Twitch chat messages via [tmi.js](https://tmijs.com/)**
```js
/**
 * Command handler function
 * @param {Object} twitch - Twitch client instance (tmi.js Client)
 * @param {Object} events - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags with user info (username, display-name, mod, subscriber, badges, etc.)
 * @param {string} message - The full message text that triggered the command
 */

export default function(twitch, events, channel, tags, message) {
  
  // Send a message to chat
  twitch.say(channel, `@${tags.username} used ${message}. The is the Twitch chat example message!`)

  // Print log to server
  console.log('▒ !example was used. This is a test message.')

  // You can also emit additional events to the overlay
  // This is optional
  events.emit('extra-event-a')
  events.emit('extra-event-b')
}
```

`overlay.js` — **Animate DOM elements via [Anime.js](https://animejs.com/)**
```js
export default function (events) {

  // Get DOM element
  let element = document.querySelector('.example-element')

  // Simple fade in and scale animation
  anime.animate(element, {
    opacity: [0, 1],
    marginTop: ['50px', '0px'],
    duration: 600,
    ease: 'outExpo',
    onComplete: () => {

      // Fade out after 2.5 seconds
      setTimeout(() => {
        anime.animate(element, {
          opacity: [1, 0],
          marginTop: ['0px', '50px'],
          duration: 600,
          ease: 'outExpo',
        })
      }, 2500)
    }
  })

  // Grab additional events from command.js
  // This is optional
  events.on('additional-a',  () => {console.log(`'additional-a' received`)})
  events.on('additional-b', () => {console.log(`'additional-b' received`)})
}
```

`config.js` — **Custom configurations for the command**
```js
/**
 * Command Configuration
 *
 * Enabled:
 * - enabled: boolean           // Whether the command is available (defaults to true if not set)
 * 
 * Permissions:
 * - permission: 'broadcaster'  // Only broadcaster
 * - permission: 'moderator'    // Broadcaster and moderators
 * - permission: 'vip'          // Broadcaster, moderators, and VIPs
 * - permission: 'subscriber'   // Broadcaster, moderators, VIPs, and subscribers
 * - permission: 'viewer'       // Everyone (default if not set)
 * 
 * Cooldown:
 * - cooldown: number           // Time in milliseconds (defaults to cooldownGlobal if not set)
 * 
 * Aliases:
 * - alias: string | string[]   // Alternative command names that trigger the same command
 *   Examples:
 *   - alias: 'demo'            // Single alias: !example and !demo both work
 *   - alias: ['demo', 'test']  // Multiple aliases: !demo and !test all work
 */

export const config = {
  enabled: true,
  permission: 'viewer',
  cooldown: 5000,
  alias: 'demo',
}

```

`assets/index.html` — **HTML will be injected into the overlay**
```html
<!-- !example command HTML -->
<div class="example-element">
  Example command!
</div>
```

`assets/style.css` — **CSS will be loaded into the overlay**
```css
.example-element {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24px 32px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 32px;
  corner-shape: squircle;
  font-size: 24px;
  font-weight: 400;
  opacity: 0;
  z-index: 1000;
  pointer-events: none;
}
```

## Built-in commands

### !commands

The `!commands` command (alias: `!command`) lists available commands in chat (app built-in).

### !kill

The `!kill` command (aliases: `!stop`, `!killall`) pauses and resets all audio, video, CSS animations/transitions, and Anime.js animations (it does not remove DOM elements). Useful when many commands are running at the same time and you want to quiet the overlay.

## Custom commands

### !hello
The `!hello` command is a minimal chat-only example; it replies in chat with "Hello, @username!". Use it as the template for commands that only send a chat message (no overlay).

### !example
The `!example` command is the example command; it sends a chat reply and triggers overlay animation.

### !train
The `!train` command runs the example train animation (Kappa emote train from right to left).

### !tts (text-to-speech)
The `!tts` command speaks text in the overlay using the browser's Speech Synthesis API. Use `!tts <message>` for default (English) or `!tts <lang> <message>` for a specific language (e.g. `!tts es hola mundo`).

Available voices depend on the viewer's operating system and browser (macOS, Windows, and Linux ship different default voices). The supported language list is kept to languages commonly present on default installs.

For the **full list of language codes** and how to **add or remove languages** (edit `commands/tts/config.js`), see [docs/TTS.md](docs/TTS.md).

### !shape
The `!shape` command updates the overlay shape, position, and color in real time. Use `!shape` with no arguments to see help. Use `!shape <cmd>` where `<cmd>` is one of: `show`, `hide`, `square`, `circle`, `rect`, `color <value>`, `top`, `bottom`, `left`, `right`, `center`, `reset`.

### !brb (Be right back)
The `!brb` and `!back` commands toggle a "be right back" overlay (broadcaster-only). Use `!brb` to turn it on (chat says "Be right back..."); use `!back` to turn it off (chat says "Back to action!" and the overlay toggles off).

### !youtube
The `!youtube` command (aliases: `!yt`, `!music`, `!video`) controls YouTube playback on the overlay. Send a YouTube URL to add a video to the queue. Subcommands: `play`, `pause`, `next`, `vol 0-100`, `queue`, `zoom`.

### !nice
The `!nice` command shows a "Nice!" overlay and plays a sound.

### !wow
The `!wow` command shows a "Wooow!" overlay and plays a random sound.

### !error
The `!error` command is a test/demo; overlay-only (no chat reply). It shows an error overlay and plays an error sound.

### !discord
The `!discord` command sends a Discord server invite link to chat. Edit `commands/discord/command.js` to set your Discord invite URL.

### !love
The `!love` command (alias: `!heart`) responds in chat with a love message to the user who triggered it.

### !lurk
The `!lurk` command (alias: `!lurking`) sends a message to chat acknowledging the user is lurking and displays an overlay animation.

### !so (Shoutout)
The `!so` command (alias: `!shoutout`) allows moderators to shout out another Twitch channel. Use `!so <channel>` to mention a channel in chat and display it on the overlay. Example: `!so podrivo`.

### !socials
The `!socials` command (aliases: `!links`, `!social`) displays your social media links in chat. Edit `commands/socials/command.js` to customize your social media links.