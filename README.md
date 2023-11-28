# Botivo
Botivo is a Twitch chatbot, with an overlay for OBS. Create and personalize your own custom commands, with infinite overlay options using HTML, CSS and JS.

Usage
---
Download or clone this repository, and install dependencies.
```shell
cd botivo
npm install
```

Make sure you create a `.env` file and set your environment variables. For the `TWITCH_PASSWORD`, you'll need a OAuth Access Token, which you won't find in your Twitch profile, but you can get it [here](https://twitchapps.com/tmi/) or [here](https://twitchtokengenerator.com/).
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
[04:20] info: Connecting to irc-ws.chat.twitch.tv on port 443..
[04:20] info: Sending authentication to server..
[04:20] info: Connected to server.
[04:20] info: Executing command: JOIN #podrivo
[04:20] info: Joined #podrivo
```

How it works
---
Botivo starts with an `app.js` to connect with Twitch chat, via [Express](https://expressjs.com/) and [tmi.js](https://tmijs.com/). Botivo will then listen for every chat message and run your code if detects your personalized command. Each command emits a key to `overlay.html` using [Socket.IO](https://socket.io/). The HTML receives this key, and fires a function that manipulates the DOM, using [anime.js](https://animejs.com/) and CSS to create animations.

In order to use your overlay as a `Browser Source` in [OBS Studio](https://obsproject.com/), you need to keep the bot running in your computer and set the URL as `http://localhost:8080`. To avoid the hassle of having to turn on the bot before every stream, you can host it in [Heroku](heroku.com) or [Koyeb](https://koyeb.com/), for example.

Example
---
Custom command `!train` is just a simple example of how to use Botivo. Inside `app.js` you can find where it's defined:
```js
// Detect !train
if (message.toLowerCase() === '!train' || message.startsWith('!train')) {

  // Emit train key
  io.emit('train')

  // Say in chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
}
```

Also, there are HTML elements to play around inside `index.html`, and JS and CSS to tweak inside `main.js` and `train.css`
```html
<div id="train-wrap">
  <div class="train-list">
    <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/3.0">
    <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/3.0">
    <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/3.0">
    <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/3.0">
    <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/3.0">
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

License
---
Released under the [MIT license](LICENSE).