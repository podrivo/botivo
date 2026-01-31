<img src="https://github.com/podrivo/botivo/assets/546221/217e12ad-10ab-438a-8828-0ef7bcca89ce" width="400" alt="Botivo logo">

Botivo combines a Twitch chatbot with a powerful OBS overlay, enabling custom commands and fully customizable overlays built with HTML, CSS, and JavaScript. Built-in Anime.js makes creating animations simple and fast.


Usage
---
Download or clone this repository, and install dependencies. You'll need [Node.js](https://nodejs.org/) installed.
```shell
cd botivo
npm install
```

Rename file `.env.example` to `.env` and set your environment variables. For `TWITCH_PASSWORD`, you'll need a OAuth Access Token, which you can get [here](https://twitchtokengenerator.com/).
```dotenv
TWITCH_USERNAME="your-bot-username"
# Your bot's Twitch username (the account that will send messages)

TWITCH_PASSWORD="oauth:your-oauth-token-here"
# Get your authorization token from: https://twitchtokengenerator.com/
# The token should start with "oauth:" (e.g., oauth:abc123xyz...)

TWITCH_CHANNEL="your-channel-name"
# The channel name where the bot will listen for commands (without the #)

SERVER_PORT="8080"
# The port number where the overlay will be served (default: 8080)
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

Open the overlay URL in your browser, go to your chat on your Twitch channel page and send a `!train` message. You should see a simple Kappa emote train animation from right to left. Detail: Make sure you click on the browser window before, so that it plays the audio. (This is not needed in OBS)


How it works
---
Botivo is initiated in `start.js`. It connects to Twitch IRC using [tmi.js](https://tmijs.com/), via an [Express](https://expressjs.com/) server.

Botivo automatically discovers and loads commands from the `/commands` directory. When a command is triggered in chat, the `command.js` emits an event via [Socket.IO](https://socket.io/) to overlay, then `overlay.js` grabs the event and triggers the DOM manipulation with [Anime.js](https://animejs.com/). Use can also use CSS to create animations and HTML5 to play audios.

In order to use your overlay as a `Browser Source` in [OBS Studio](https://obsproject.com/), you need to keep the bot running in your computer and set the overlay URL that is included in your terminal log, usually `http://localhost:8080`.


What it can't do
---
Due to how Twitch API works, this bot can only see chat messages. You won't be able to detect new followers, raids, channel points or any other Twitch functionality other than chat. It relies on [tmi.js](https://tmijs.com/) to connect with Twitch IRC, so make sure you see their [documentation](https://tmijs.com/#guide) for more details.


Commands
---
Each command consists of:
```js
command.js  // Server side of things (required)
overlay.js  // Overlay side of things (optional)
config.js   // Set custom configurations (optional)
index.html  // HTML is injected into the overlay (optional)
style.css   // CSS is loaded into the overlay (optional)
```

Commands `!example` and `!train` are just examples of how to use Botivo. To create a new command, duplicate the `/commands/example` and rename the folder `/commands/mycommand/`.

### Built-in commands

- `!commands` — lists available commands in chat (app built-in)
- `!kill` (aliases: `!stop`, `!killall`, `!kill-all`) — stop all overlay activity (app built-in; see [Kill](#kill))
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
  cooldown: 5000,
  alias: 'demo',
  permission: 'viewer',
  enabled: true
}

```

`index.html` — **HTML will be injected into the overlay**
```html
<!-- !example command HTML -->
<div class="example-element">
  Example command!
</div>
```

`style.css` — **CSS will be loaded into the overlay**
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