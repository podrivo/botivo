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
command.js  // Server side of things
overlay.js  // Overlay side of things
config.js   // Set custom configurations
index.html  // HTML is injected into the overlay
style.css   // CSS is loaded into the /overlay/index.html
```

Commands `!example` and `!train` are just examples of how to use Botivo. To create a new command, duplicate the `/commands/example` and rename the folder `/commands/mycommand/`.

`command.js` — **Sends Twitch chat messages via [tmi.js](https://tmijs.com/)**
```js
/**
 * Command handler function
 * @param {Object} client - Twitch client instance (tmi.js Client)
 * @param {Object} io - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags with user info (username, display-name, mod, subscriber, badges, etc.)
 * @param {string} message - The full message text that triggered the command
 */

export default function(client, io, channel, tags, message) {
  
  // Send a message to chat
  client.say(channel, `@${tags.username} used ${message}. The is the Twitch chat example message!`)

  // Print log to server
  console.log('▒ !example was used. This is a test message.')

  // You can also emit additional events to the overlay
  // This is optional
  io.emit('extra-event-a')
  io.emit('extra-event-b')
}
```

`overlay.js` — **Animate DOM elements via [Anime.js](https://animejs.com/)**
```js
export default function (socket) {

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
  socket.on('additional-a',  () => {console.log(`'additional-a' received`)})
  socket.on('additional-b', () => {console.log(`'additional-b' received`)})
}
```

`config.js` — **Custom configurations for the command**
```js
/**
 * Command Configuration
 * 
 * Active:
 * - active: boolean            // Whether the command is available (defaults to true if not set)
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
  active: true
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

Stop all running commands
---
In case commands are too much and you can reset the overlay. `!kill` will stop all animations and audios, and reset DOM elements. This works great in case many commands are running at the same time and are creating chaos. It has 3 aliases: 'stop', 'killall' and 'kill-all'.


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