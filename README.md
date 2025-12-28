<img src="https://github.com/podrivo/botivo/assets/546221/217e12ad-10ab-438a-8828-0ef7bcca89ce" width="400" alt="Botivo logo">

Botivo is a Twitch chatbot, with an overlay that can be used as a `Browser Source` in OBS Studio. Create and personalize your own commands, with infinite overlay possibilities using HTML, CSS and JS. It comes with `anime.js` out of the box, so you can start creating day one.

Usage
---
Download or clone this repository, and install dependencies.
```shell
cd botivo
npm install
```

Make sure you create a `.env` file and set your environment variables. For `TWITCH_PASSWORD`, you'll need a OAuth Access Token, which you won't find in your Twitch profile, but you can get it [here](https://twitchapps.com/tmi/) or [here](https://twitchtokengenerator.com/).
```dotenv
TWITCH_CHANNEL=your-channel-name
TWITCH_USERNAME=your-bot-name
TWITCH_PASSWORD=oauth:your-access-token
SERVER_PORT=8080
```

Start the application and you should get logs on your terminal.
```shell
npm start
```
```shell
Your overlay URL: http://localhost:8080
[16:20] info: Connecting to irc-ws.chat.twitch.tv on port 443..
[16:20] info: Sending authentication to server..
[16:20] info: Connected to server.
[16:20] info: Executing command: JOIN #TWITCH_CHANNEL
[16:20] info: Joined #TWITCH_CHANNEL
```

Open the overlay URL in your browser, go to your chat on your Twitch channel page and send a `!train` message. You should see a simple Kappa emote train animation from right to left.
```shell
[16:20] info: [#TWITCH_CHANNEL] <user>: !train
[16:20] info: [#TWITCH_CHANNEL] <TWITCH_USERNAME>: @user, hop on! Train is about to leave!
```

How it works
---
Botivo starts with `start.js` that connects with Twitch chat (IRC), via [Express](https://expressjs.com/) and [tmi.js](https://tmijs.com/). Botivo automatically discovers and loads commands from the `commands/` directory. Each command consists of server-side and client-side files. When a command is triggered in chat, the server-side handler emits a Socket.IO event, which the client-side handler receives and uses to manipulate the DOM with [anime.js](https://animejs.com/) and CSS to create animations.

In order to use your overlay as a `Browser Source` in [OBS Studio](https://obsproject.com/), you need to keep the bot running in your computer and set the overlay URL that is included in your terminal log.

Example
---
Custom command `!train` is just a simple example of how to use Botivo. Commands are organized in the `commands/` directory, with each command having its own folder. To create a new command, create a folder (e.g., `commands/mycommand/`) and add the following files:

**Server-side handler** (`commands/train/train-server.js`):
```js
// Train command handler
export function handleTrain(client, io, channel, tags, message) {
  // Emit train key
  io.emit('train')

  // Say in chat with error handling
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
    .catch(err => console.error('× Error sending message to chat:', err.message))
}
```

**Client-side handler** (`commands/train/train-client.js`):
```js
// Train command handler
export function initTrainCommand(socket) {
  // Get DOM element
  let trainList = document.querySelector('.train-list')

  if (!trainList) {
    console.error('Error: .train-list element not found')
    return
  }

  // Listen for the 'train' socket event
  socket.on('train', () => {
    try { 
      // Reset style and set new
      trainList.removeAttribute('style')
      trainList.style.top = Math.floor(Math.random() * (screen.height * 0.5)) + 'px'

      // Animation using anime.js v4.2
      let animation = anime.animate(trainList, {
        translateX: '-6000px',
        ease: 'linear',
        duration: 10000,
        autoplay: false
      })
      animation.restart()
      animation.resume()

      // Play audio with error handling
      const audio = new Audio('/commands/train/train.wav')
      audio.play().catch(err => {
        console.warn('Could not play audio (may require user interaction):', err)
      })
    } catch (err) {
      console.error('Error handling train command:', err)
    }
  })
}
```

**HTML template** (`commands/train/train.html`):
```html
<!-- !train command -->
<div id="train-wrap">
  <div class="train-list">
    <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/3.0">
    <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/3.0">
    <!-- ... more images ... -->
  </div>
</div>
```

**CSS styles** (`commands/train/train.css`):
```css
.train-list img {
  width: 48px;
  height: auto;
  animation: upDown 4s ease-in-out infinite;
}

@keyframes upDown {
  0%, 100% {
    transform: translateY(-100px);
  }

  50% {
    transform: translateY(100px);
  }
}
```

**Command structure:**
- The command name is derived from the folder name (e.g., `train/` → `!train`)
- Server handler must export `handle{CommandName}` function (e.g., `handleTrain`)
- Client handler must export `init{CommandName}Command` function (e.g., `initTrainCommand`)
- HTML, CSS, and optional audio files are automatically discovered and loaded

What it can't do
---
Due to how Twitch API works, this bot can only see chat messages. You won't be able to detect new followers, raids, channel points or any other Twitch functionality other than chat. It relies on [tmi.js](https://tmijs.com/) to connect with Twitch, so make sure you see their [documentation](https://tmijs.com/#guide) for more details.

License
---
Released under the [MIT license](LICENSE).