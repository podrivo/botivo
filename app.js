// Imports
import dotenv from 'dotenv'
import http from 'http'
import express from 'express'
import socketIo from 'socket.io'
import tmi from 'tmi.js'

// Set dotenv
dotenv.config()

// Express.js + Socket.IO
const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const port = process.env.PORT

app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile(__dirname + '/public/overlay.html'))
server.listen(port, () => console.log(`Your overlay URL: http://localhost:${port}`))

// tmi.js
const client = new tmi.Client({
  options: {
    debug: true
  },
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_PASSWORD
  },
  channels: [process.env.TWITCH_CHANNEL]
})
client.connect()

// Message received
client.on('message', (channel, tags, message, self) => {
  if (self) return

  // Detect !train
  if (message.toLowerCase() === '!train' || message.startsWith('!train')) {

    // Emit train message
    io.emit('train')

    // Say in chat
    client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
  }
})

