// Imports
import dotenv from 'dotenv'
import http from 'http'
import express from 'express'
import socketIo from 'socket.io'
import tmi from 'tmi.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

// Set dotenv
dotenv.config()

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '.env')

// Check if .env file exists
if (!existsSync(envPath)) {
  console.error('× File .env was not found')
  process.exit(1)
}

// Validate environment variables
const requiredVars = ['TWITCH_USERNAME', 'TWITCH_PASSWORD', 'TWITCH_CHANNEL', 'SERVER_PORT']
const missingVars = requiredVars.filter(v => !process.env[v])

if (missingVars.length > 0) {
  console.error(`× Missing required environment variables: ${missingVars.map(v => `${v}`).join(', ')}`)
  process.exit(1)
}

// Validate SERVER_PORT
const port = parseInt(process.env.SERVER_PORT, 10)
if (isNaN(port) || port < 1 || port > 65535) {
  console.error(`× SERVER_PORT must be a valid number between 1 and 65535. Got: ${process.env.SERVER_PORT}`)
  process.exit(1)
}

// Express.js + Socket.IO
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static('overlay'))
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'overlay', 'overlay.html'))
})

// Server error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`× Port ${port} is already in use`)
  } else {
    console.error('× Server error:', err)
  }
  process.exit(1)
})

// Server success
server.listen(port, () => {
  console.log(`█ Botivo started`)
  console.log(`▒ Your overlay URL is: http://localhost:${port}`)
})

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

// Twitch connection error handling
client.on('disconnected', (reason) => {
  console.error(`▒ Twitch disconnected`)
})

client.connect().catch((err) => {
  console.error('× Failed to connect to Twitch:', err)
  if (err.includes('Login authentication failed')) {
    console.error('× Check your TWITCH_USERNAME and TWITCH_PASSWORD in .env')
  }
  process.exit(1)
})

// Message received
client.on('message', (channel, tags, message, self) => {
  if (self) return

  try {
    // Detect !train
    if (message.toLowerCase() === '!train' || message.startsWith('!train')) {
      // Emit train key
      io.emit('train')

      // Say in chat with error handling
      client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
        .catch(err => console.error('× Error sending message to chat:', err.message))
    }
  } catch (err) {
    console.error('× Error processing message:', err.message)
  }
})

