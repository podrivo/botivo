// Imports
import tmi from 'tmi.js'
import { processCommand } from './commands.js'

// Start Twitch client
export function startClient(io) {
  const client = new tmi.Client({
    options: {
      debug: false
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

    // Process commands
    processCommand(client, io, channel, tags, message)
  })

  return client
}

