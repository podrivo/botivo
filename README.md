<img src="https://github.com/podrivo/botivo/assets/546221/217e12ad-10ab-438a-8828-0ef7bcca89ce" width="400" alt="Botivo logo">

Botivo combines a Twitch chatbot with a powerful OBS overlay, enabling custom commands and fully customizable overlays built with HTML, CSS, and JavaScript. Built-in Anime.js makes creating animations simple and fast.

### Quick start

1. Install [Node.js](https://nodejs.org/).
2. Clone the repo and run `npm install`.
3. Copy `.env.example` to `.env` (e.g. `cp .env.example .env` on Mac/Linux).
4. Get a Twitch token — see [docs/TWITCH_TOKEN.md](docs/TWITCH_TOKEN.md).
5. Fill `.env` with `TWITCH_USERNAME`, `TWITCH_TOKEN`, `TWITCH_CHANNEL`, and optionally `SERVER_PORT`.
6. Run `npm start`.
7. Add the overlay in OBS — see [docs/OBS_SETUP.md](docs/OBS_SETUP.md). Use the URL printed in the terminal (e.g. `http://localhost:8080`).

### Glossary

- **Overlay** — The browser page that shows your alerts/animations; you add its URL as a Browser Source in OBS.
- **Command** — A trigger like `!train`; when someone types it in chat, the bot and (optionally) the overlay react.
- **OBS Browser Source** — In OBS: Add Source → Browser → enter the overlay URL so the stream shows the overlay.

Usage
---
Download or clone this repository, and install dependencies. You'll need [Node.js](https://nodejs.org/) installed.
```shell
cd botivo
npm install
```

Rename file `.env.example` to `.env` and set your environment variables. For `TWITCH_TOKEN`, you'll need a OAuth Access Token, which you can get [here](https://twitchtokengenerator.com/).
```dotenv
# Your bot's Twitch username (the account that will send messages)
TWITCH_USERNAME="your-bot-username"

# Get your authorization token from: https://twitchtokengenerator.com/
TWITCH_TOKEN="your-access-token-here"

# The channel name where the bot will listen for commands (without the #)
TWITCH_CHANNEL="your-channel-name"

# The port number where the overlay will be served (default: 8080)
SERVER_PORT="8080"
```

Start the application:
```shell
npm start
```

You should see logs on your terminal:
```shell
█ BOTIVO starting...

▒ Variables   ✓ Found .env and environment variables
▒ Overlay     ✓ Server is running on http://localhost:8080
▒ Events      ✓ Communication with overlay started
▒ Twitch      ✓ Connected to channel 'channel', with user 'user'
▒ Commands    ✓ Successfully loaded 3 commands

█ BOTIVO is ready to go!
```

Open the overlay URL in your browser, go to your chat on your Twitch channel page and send a `!train` message. You should see a simple Kappa emote train animation from right to left. Detail: Make sure you click on the browser window before, so that it plays the audio. (This is not needed in OBS) For setup steps, see [Quick start](#quick-start) and [OBS setup](docs/OBS_SETUP.md).


How it works
---
Botivo is initiated in `start.js`. It connects to Twitch IRC using [tmi.js](https://tmijs.com/), via an [Express](https://expressjs.com/) server.

Botivo automatically discovers and loads commands from the `/commands` directory. When a command is triggered in chat, the `command.js` emits an event via [Socket.IO](https://socket.io/) to overlay, then `overlay.js` grabs the event and triggers the DOM manipulation with [Anime.js](https://animejs.com/). Use can also use CSS to create animations and HTML5 to play audios.

In order to use your overlay as a `Browser Source` in [OBS Studio](https://obsproject.com/), you need to keep the bot running in your computer and set the overlay URL that is included in your terminal log, usually `http://localhost:8080`.


What it can't do
---
Due to how Twitch API works, this bot can only see chat messages. You won't be able to detect new followers, raids, channel points or any other Twitch functionality other than chat. It relies on [tmi.js](https://tmijs.com/) to connect with Twitch IRC, so make sure you see their [documentation](https://tmijs.com/#guide) for more details.

### Troubleshooting

- **Bot doesn't respond to commands** — Check `TWITCH_CHANNEL` (no `#`), `TWITCH_USERNAME` and `TWITCH_TOKEN` in `.env`; ensure the bot account is in the channel and the token is valid ([docs/TWITCH_TOKEN.md](docs/TWITCH_TOKEN.md)).
- **Overlay is blank** — Open the overlay URL in a browser first to confirm it loads; ensure the bot is running and the overlay tab is open (or OBS is using the same URL).
- **Port already in use** — Change `SERVER_PORT` in `.env` to another port (e.g. 8081) and use that URL in OBS.

Commands
---
### Adding a new command

1. **Copy a template** — For a **chat-only** command (no overlay): copy the `commands/hello` folder. For a **chat + overlay** command: copy the `commands/example` folder.
2. **Rename the folder** — Rename it to your command name (e.g. `meme` → use `!meme` in chat).
3. **Edit the chat message** — In `command.js`, change what the bot says (e.g. `twitch.say(...)`).
4. **If you want overlay** — Edit `overlay.js` and the files in `assets/` (HTML, CSS, sounds, etc.).
5. **Optional** — In `config.js` set cooldown, permission, or alias.

Each command consists of:
```js
command.js  // Server side (required)
overlay.js  // Overlay side (optional)
config.js   // Custom config (optional)
assets/     // HTML, CSS, JS, images, audio, etc.; injected into the overlay (optional)
```

### Built-in commands

- `!commands` — lists available commands in chat (app built-in)
- `!kill` (aliases: `!stop`, `!killall`, `!kill-all`) — stop all overlay activity (app built-in; see [Kill](#kill))
- `!hello` — chat-only example (replies "Hello, @username!")
- `!example` — example command
- `!train` — example command (train animation)
- `!tts` — text-to-speech (see [TTS](#tts-text-to-speech))
- `!shape` — control overlay shape, position, and color
- `!brb` / `!back` — broadcaster "be right back" toggle
- `!youtube` (aliases: `!yt`, `!music`, `!video`) — YouTube playback control
- `!nice` — "Nice!" overlay + sound
- `!wow` — "Wooow!" overlay + random sound
- `!error` — test/demo: overlay-only (no chat reply); shows error overlay and plays error sound

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
  border-radius: 20px;
  font-family: sans-serif;
  font-size: 24px;
  font-weight: 400;
  opacity: 0;
  z-index: 1000;
  pointer-events: none;
}
```

### Command reference

### Commands

The `!commands` command lists available commands in chat (app built-in).

### Kill

The `!kill` command (aliases: `!stop`, `!killall`, `!kill-all`) pauses and resets all audio, video, CSS animations/transitions, and Anime.js animations (it does not remove DOM elements). Useful when many commands are running at the same time and you want to quiet the overlay.

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
  cooldownGlobal: 5000         // Global cooldown if a command doesn't specify its own
}
```


License
---
Released under the [MIT license](LICENSE).