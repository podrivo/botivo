<img src="https://github.com/podrivo/botivo/assets/546221/217e12ad-10ab-438a-8828-0ef7bcca89ce" width="400" alt="Botivo logo">

Botivo combines a Twitch chatbot with a powerful OBS overlay, enabling custom commands and fully customizable overlays built with HTML, CSS, and JavaScript. Built-in libraries makes creating animations simple and fast.


The application listens to your Twitch chat, and when a command is typed it can both reply in chat and/or emmit events to the overlay — a webpage loaded via Browser Source in OBS Studio — to play an animation, video or sound.

Add infinite commands by just adding new folders and files. There are examples included to help you get started. Check how commands works, and customize everything you need.


Usage
---
Make sure [Node.js](https://nodejs.org/) is installed in your machine. [Download](https://github.com/podrivo/botivo/releases) or clone this repository.

Open your system's terminal, navigate to the downloaded folder and install.
```shell
cd botivo
npm install
```

After installing, start the application and follow instructions. Setup will set Twitch's username, channel and authorizations in a `.env` file.
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


How it works
---
Botivo is initiated in `start.js`. It connects to Twitch IRC using [tmi.js](https://tmijs.com/), via an [Express](https://expressjs.com/) server.

It automatically discovers and loads commands from the `/commands` directory. When a command is triggered in chat, the `command.js` emits an event via [Socket.IO](https://socket.io/) to overlay, then `overlay.js` grabs the event and triggers the DOM manipulation.

Use any JavaScript library and CSS to create animations and HTML5 to play audios and videos. It comes with built-in libraries — [Anime.js](https://animejs.com/), [Splitting.js](https://splitting.js.org/) and [Fitty](https://rikschennink.github.io/fitty/) — for animations and text effects.

To use your overlay as a `Browser Source` in [OBS Studio](https://obsproject.com/), you need to keep the bot running in your computer and set the overlay URL that is included in your terminal log, usually `http://localhost:8080`.


Command structure
---
Create new folders inside `/commands/`. Command name will be the same as the folder's name, so `/commands/name/` will create command `!name`.
```js
command.js  // Server side (required)
overlay.js  // Overlay side (optional)
config.js   // Custom config (optional)
assets/     // HTML, CSS, JS, images, audio, etc.; injected into the overlay (optional)
```

Commands ready-to-use
---
Botivo ships with 2 built-in commands and 15 custom commands. These are just small examples of possible things you can create.

| Name |   | Alias |  |
|---------|-------------|---------|---------|
| `!commands` | Lists available commands in chat | `!command` | Built-in |
| `!kill` | Stop all overlay activity | `!stop`, `!killall` | Built-in |
| `!hello` | Chat-only example | | Custom |
| `!example` | Example command | | Custom |
| `!train` | Kappa emote train animation from right to left | | Custom |
| `!tts` | Text-to-speech (see [TTS](#tts-text-to-speech)) | | Custom |
| `!shape` | Control an element's shape, position, and color | | Custom |
| `!brb` | Broadcaster "be right back" toggle | `!back` | Custom |
| `!youtube` | YouTube playback control | `!yt`, `!music`, `!video` | Custom |
| `!nice` | Overlay animation + sound | | Custom |
| `!wow` | Overlay animation + random sound | | Custom |
| `!error` | Overlay animation + sound | | Custom |
| `!discord` | Sends Discord server invite link | | Custom |
| `!love` | Responds with love message | `!heart` | Custom |
| `!lurk` | Shows lurking message with overlay | `!lurking` | Custom |
| `!so` | Shoutout to another Twitch channel | `!shoutout` | Custom |
| `!socials` | Displays social media links | `!links`, `!social` | Custom |


Command configuration
---
If you need to customize a command configuration, you can edit `/commands/name/config.js`.
```js
export const config = {
  enabled: true,              // Whether the command is available (defaults to true if not set)
  permission: 'broadcaster',  // Permissions roles (lowest → highest): viewer (default), subscriber, vip, moderator, broadcaster.
  cooldown: 1000,             // Time in milliseconds (defaults to 'cooldownGlobal' if not set)
  alias: ['demo', 'test']     // Alternative command names that trigger the same command
}

```


Global configuration
---
If you need to customize Botivo, you can edit `/app/config.js`.
```js
export const CONFIG = {
  prefix: '!',                 // Command prefix ("!" for !train, !example)
  twitchReconnect: true,       // Automatically reconnect to Twitch on disconnect
  folderCommands: 'commands',  // Directory name where commands are stored
  folderOverlay: 'overlay',    // Directory name where overlay files are stored
  cooldownGlobal: 5000,        // Global cooldown if a command doesn't specify its own

  defaultCommands: {

    // Config !commands
    commands: {
      enabled: true,
      cooldown: 0,
      alias: ['command'],
      showAliases: false       // Show aliases: "!example [!demo]" vs "!example"
    },
    // Config !kill
    kill: {
      enabled: true,
      cooldown: 0,
      permission: 'broadcaster',
      alias: ['stop', 'killall']
    }
  }
}
```


Additional docs
---
- [docs/COMMANDS.md](docs/COMMANDS.md) — Adding and configuring commands; built-in and custom command reference.
- [docs/OBS_SETUP.md](docs/OBS_SETUP.md) — Add the overlay to OBS Studio (Browser Source).
- [docs/OVERLAY_LIBRARIES.md](docs/OVERLAY_LIBRARIES.md) — Anime.js, Splitting.js, and Fitty usage in the overlay.
- [docs/TTS.md](docs/TTS.md) — Text-to-speech language codes and how to add or remove languages.
- [docs/TWITCH_TOKEN.md](docs/TWITCH_TOKEN.md) — Get a Twitch OAuth token for the bot.


What it can't do
---
Due to how Twitch API works, this bot can only see chat messages. You won't be able to detect new followers, raids, channel points or any other Twitch functionality other than chat. It relies on [tmi.js](https://tmijs.com/) to connect with Twitch IRC, so make sure you see their [documentation](https://tmijs.com/#guide) for more details.


Contributors
---
Special thanks to friends helping me with new command ideas, providing feedback, testing versions, and suporting me along the way! 💜

[CreepyCrappyShow](https://www.twitch.tv/creepycrappyshow), [clonk_4_ever](https://www.twitch.tv/clonk_4_ever) and [beekerr_](https://www.twitch.tv/beekerr_)


License
---
Released under the [MIT license](LICENSE).