# Botivo

Botivo is a simple Twitch chatbot with an overlay for OBS.

How this works
---
`app.js` detects all messages in chat, via an [Express](https://expressjs.com/) app with [tmi.js](https://tmijs.com/). Then each command emits a key to the `overlay.html` using [Socket.IO](https://socket.io/). The HTML receives this key, also via Socket.IO, and fires a function that manipulates the DOM, using [anime.js](https://animejs.com/) and CSS to create animations. This way you can use a `Browser Source` in [OBS Studio](https://obsproject.com/), that will react to chat commands.

License
---
Released under the [MIT license](LICENSE).