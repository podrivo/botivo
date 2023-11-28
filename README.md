# Botivo

Botivo is a simple Twitch chatbot with an overlay for OBS.

How this works
---
app.js detects all messages in chat, via an [Express](https://expressjs.com/) app with [tmi.js](https://tmijs.com/). Then each command emits a key to the `overlay.html` using [Socket.IO](https://socket.io/). The HTML receives the key, also via Socket.io, and fires a command that manipulates the DOM, with [anime.js](https://animejs.com/) and CSS animations.

License
---
Released under the [MIT license](LICENSE).