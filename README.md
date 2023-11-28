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
PORT=8080
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
Botivo starts with an `app.js` that connects with Twitch chat (IRC), via [Express](https://expressjs.com/) and [tmi.js](https://tmijs.com/). Botivo will then listen for every chat message and run your code if detects your custom command. Each command emits a key to `overlay.html` using [Socket.IO](https://socket.io/). The HTML receives this key, and fires a function that manipulates the DOM, using [anime.js](https://animejs.com/) and CSS to create animations.

In order to use your overlay as a `Browser Source` in [OBS Studio](https://obsproject.com/), you need to keep the bot running in your computer and set the overlay URL that is included in your terminal log. To avoid the hassle of having to turn on the bot before every stream, you can host it in [Heroku](heroku.com) or [Koyeb](https://koyeb.com/), for example.

Example
---
Custom command `!train` is just a simple example of how to use Botivo. Make sure you create your own commands and plug in whatever library you'll need. Inside `app.js` you'll find the command detection:
```js
// Detect !train
if (message.toLowerCase() === '!train' || message.startsWith('!train')) {

  // Emit train key
  io.emit('train')

  // Say in chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
}
```

Also, in this example you'll find HTML elements inside `overlay.html`, JS in `main.js` and CSS in `train.css`.
```html
<div id="train-wrap">
  <div class="train-list">
    <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/3.0">
    [...]
  </div>
</div>
```
```js
socket.on('train', () => {

  // Reset style and set new
  trainList.removeAttribute('style')
  trainList.style.top = Math.floor(Math.random() * (screen.height * 0.5)) + 'px'

  // Animation
  let animation = anime({
    targets: trainList,
    translateX: '-6000px',
    easing: 'linear',
    duration: 10000,
    autoplay: false
  })
  animation.restart()
  animation.play()

  // Play audio
  const audio = new Audio('../audio/train.wav')
  audio.play()
})
```
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

What it can't do
---
Due to how Twitch API works, this bot can only see chat messages. You won't be able to detect new followers, raids, channel points or any other Twitch functionality other than chat. It relies on [tmi.js](https://tmijs.com/) to connect with Twitch, so make sure you see their [documentation](https://tmijs.com/#guide) for more details.

License
---
Released under the [MIT license](LICENSE).