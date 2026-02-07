<img src="https://github.com/podrivo/botivo/assets/546221/217e12ad-10ab-438a-8828-0ef7bcca89ce" width="400" alt="Botivo logo">

Botivo combines a Twitch chatbot with a powerful OBS overlay, enabling custom commands and fully customizable overlays built with HTML, CSS, and JavaScript. Built-in libraries makes creating animations simple and fast.


How it works
---
Botivo listens to your Twitch chat, and when a command is typed it can both reply in chat and/or emmit events to the overlay — a webpage loaded via Browser Source in OBS Studio — to play an animation, video or sound.

Add infinite commands by just adding new folders and files. There are examples included to help you get started. Make sure to check how commands works, and customize everything you need.


Usage
---
Make sure [Node.js](https://nodejs.org/) is installed in your machine. [Download](https://github.com/podrivo/botivo/releases) or clone this repository.

Open your system's terminal, navigate to the downloaded folder and install.
```shell
cd botivo
npm install
```

After installing, start the application and follow instructions. Setup will set Twitch's username, channel and authorizations in `.env` file.
```shell
npm start
```

You should see logs on your terminal:
```shell
█ BOTIVO starting...

▒ Variables   ✓ Found .env and environment variables
▒ Overlay     ✓ Add this URL in OBS (Browser Source) → http://localhost:8080
▒ Events      ✓ Communication with overlay started
▒ Twitch      ✓ Connected to channel 'podrivo', with user 'LemosTheBot'
▒ Commands    ✓ Successfully loaded 15 custom and 2 built-in commands

█ BOTIVO is ready to go!
```

Add the overlay URL in your OBS. Go to your Twitch channel chat page and send a `!train` message. You should see a simple Kappa emote train animation from right to left.

For setup steps, see [OBS setup](docs/OBS_SETUP.md).


How it technically works
---
Botivo is initiated in `start.js`. It connects to Twitch IRC using [tmi.js](https://tmijs.com/), via an [Express](https://expressjs.com/) server.

Botivo automatically discovers and loads commands from the `/commands` directory. When a command is triggered in chat, the `command.js` emits an event via [Socket.IO](https://socket.io/) to overlay, then `overlay.js` grabs the event and triggers the DOM manipulation.

Use any JavaScript library and CSS to create animations and HTML5 to play audios and videos. Built-in libraries [Anime.js](https://animejs.com/), [Splitting.js](https://splitting.js.org/) and [Fitty](https://rikschennink.github.io/fitty/) for animations and text effects.

To use your overlay as a `Browser Source` in [OBS Studio](https://obsproject.com/), you need to keep the bot running in your computer and set the overlay URL that is included in your terminal log, usually `http://localhost:8080`.

See [docs/OVERLAY_LIBRARIES.md](docs/OVERLAY_LIBRARIES.md) for default options and how they're used.


What it can't do
---
Due to how Twitch API works, this bot can only see chat messages. You won't be able to detect new followers, raids, channel points or any other Twitch functionality other than chat. It relies on [tmi.js](https://tmijs.com/) to connect with Twitch IRC, so make sure you see their [documentation](https://tmijs.com/#guide) for more details.

Commands
---
### Structure
```js
command.js  // Server side (required)
overlay.js  // Overlay side (optional)
config.js   // Custom config (optional)
assets/     // HTML, CSS, JS, images, audio, etc.; injected into the overlay (optional)
```


### Adding a new command
1. **Copy a template** — For a **chat-only** command (no overlay): copy the `commands/hello` folder. For a **chat + overlay** command: copy the `commands/example` folder.
2. **Rename the folder** — Rename it to your command name (e.g. `meme` → use `!meme` in chat).
3. **Edit the chat message** — In `command.js`, change what the bot says (e.g. `twitch.say(...)`).
4. **If you want overlay** — Edit `overlay.js` and the files in `assets/` (HTML, CSS, sounds, etc.).
5. **Optional** — In `config.js` set cooldown, permission, or alias.


### Built-in commands
| Name | Description | Alias |
|---------|-------------|---------|
| `!commands` | Lists available commands in chat (app built-in). | `!command` |
| `!kill` | Stop all overlay activity (app built-in; see [Kill](#kill)). | `!stop`, `!killall` |

### Example commands
| Name | Description | Alias |
|---------|-------------|---------|
| `!hello` | Chat-only example (replies "Hello, @username!"). | — |
| `!example` | Example command. | — |
| `!train` | Example command (train animation). | — |
| `!tts` | Text-to-speech (see [TTS](#tts-text-to-speech)). | — |
| `!shape` | Control overlay shape, position, and color. | — |
| `!brb` | Broadcaster "be right back" toggle. | `!back` |
| `!youtube` | YouTube playback control. | `!yt`, `!music`, `!video` |
| `!nice` | "Nice!" overlay + sound. | — |
| `!wow` | "Wooow!" overlay + random sound. | — |
| `!error` | Test/demo: overlay-only (no chat reply); shows error overlay and plays error sound. | — |
| `!discord` | Sends Discord server invite link. | — |
| `!love` | Responds with love message. | `!heart` |
| `!lurk` | Shows lurking message with overlay. | `!lurking` |
| `!so` | Shoutout to another Twitch channel (moderator-only). | `!shoutout` |
| `!socials` | Displays social media links. | `!links`, `!social` |

### Command files
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

### Command reference

### Commands

The `!commands` command (alias: `!command`) lists available commands in chat (app built-in).

### Kill

The `!kill` command (aliases: `!stop`, `!killall`) pauses and resets all audio, video, CSS animations/transitions, and Anime.js animations (it does not remove DOM elements). Useful when many commands are running at the same time and you want to quiet the overlay.

### Hello

The `!hello` command is a minimal chat-only example; it replies in chat with "Hello, @username!". Use it as the template for commands that only send a chat message (no overlay).

### Example

The `!example` command is the example command; it sends a chat reply and triggers overlay animation.

### Train

The `!train` command runs the example train animation (Kappa emote train from right to left).

### TTS (Text-to-speech)

The `!tts` command speaks text in the overlay using the browser's Speech Synthesis API. Use `!tts <message>` for default (English) or `!tts <lang> <message>` for a specific language (e.g. `!tts es hola mundo`).

Available voices depend on the viewer's operating system and browser (macOS, Windows, and Linux ship different default voices). The supported language list is kept to languages commonly present on default installs.

For the **full list of language codes** and how to **add or remove languages** (edit `commands/tts/config.js`), see [docs/TTS.md](docs/TTS.md).

### Shape

The `!shape` command updates the overlay shape, position, and color in real time. Use `!shape` with no arguments to see help. Use `!shape <cmd>` where `<cmd>` is one of: `show`, `hide`, `square`, `circle`, `rect`, `color <value>`, `top`, `bottom`, `left`, `right`, `center`, `reset`.

### BRB (Be right back)

The `!brb` and `!back` commands toggle a "be right back" overlay (broadcaster-only). Use `!brb` to turn it on (chat says "Be right back..."); use `!back` to turn it off (chat says "Back to action!" and the overlay toggles off).

### YouTube

The `!youtube` command (aliases: `!yt`, `!music`, `!video`) controls YouTube playback on the overlay. Send a YouTube URL to add a video to the queue. Subcommands: `play`, `pause`, `next`, `vol 0-100`, `queue`, `zoom`.

### Nice

The `!nice` command shows a "Nice!" overlay and plays a sound.

### Wow

The `!wow` command shows a "Wooow!" overlay and plays a random sound.

### Error

The `!error` command is a test/demo; overlay-only (no chat reply). It shows an error overlay and plays an error sound.

### Discord

The `!discord` command sends a Discord server invite link to chat. Edit `commands/discord/command.js` to set your Discord invite URL.

### Love

The `!love` command (alias: `!heart`) responds in chat with a love message to the user who triggered it.

### Lurk

The `!lurk` command (alias: `!lurking`) sends a message to chat acknowledging the user is lurking and displays an overlay animation.

### SO (Shoutout)

The `!so` command (alias: `!shoutout`) allows moderators to shout out another Twitch channel. Use `!so <channel>` to mention a channel in chat and display it on the overlay. Example: `!so podrivo`.

### Socials

The `!socials` command (aliases: `!links`, `!social`) displays your social media links in chat. Edit `commands/socials/command.js` to customize your social media links.


Global configuration
---
If you need to customize Botivo, you can edit `/app/config.js`.
```js
// Botivo configuration
export const CONFIG = {
  prefix: '!',                 // Command prefix ("!" for !train, !example)
  twitchReconnect: true,       // Automatically reconnect to Twitch on disconnect
  folderCommands: 'commands',  // Directory name where commands are stored
  folderOverlay: 'overlay',    // Directory name where overlay files are stored
  cooldownGlobal: 5000,        // Global cooldown if a command doesn't specify its own

  // Built-in default commands configuration
  defaultCommands: {
    commands: {
      enabled: true,
      cooldown: 0,
      alias: ['command'],
      showAliases: false // Show aliases in !commands output: "!example [!demo]" vs "!example"
    },
    kill: {
      enabled: true,
      cooldown: 0,
      permission: 'broadcaster',
      alias: ['stop', 'killall']
    }
  }
}
```


Contributors
---
[CreepyCrappyShow](https://www.twitch.tv/creepycrappyshow), [clonk_4_ever](https://www.twitch.tv/clonk_4_ever) and [beekerr_](https://www.twitch.tv/beekerr_)


License
---
Released under the [MIT license](LICENSE).