# Botivo

Botivo is a simple Twitch chatbot with an overlay for OBS.

How this works
---
app.js detects the message via an Express app with tmi.js. Then each command emits a key to the index.html using socket.io and sends a chat message. The HTML receives the key via socket.io and fires a command that manipulates the DOM, with anime.js and CSS animations.

License
---
Released under the [MIT license](LICENSE).