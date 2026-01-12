// Imports
import tmi from 'tmi.js'
import { processCommand } from './commands.js'
import { CONFIG } from './config.js'

// Start Twitch client
export function startTwitch(io) {
  return new Promise((resolve, reject) => {
    const client = new tmi.Client({
      options: {
        debug: CONFIG.debug
      },
      connection: {
        reconnect: CONFIG.twitchReconnect
      },
      identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_PASSWORD
      },
      channels: [process.env.TWITCH_CHANNEL]
    })

    client.on('connected', () => {
      console.log(`▒ Twitch      Connected to ${process.env.TWITCH_CHANNEL} as ${process.env.TWITCH_USERNAME}`)
      resolve(client)
    })
    client.on('disconnected', () => {console.error(`▒ Twitch disconnected`)})

    client.connect().catch((err) => {
      console.error('× Failed to connect to Twitch:', err)
      if (err.includes('Login authentication failed')) {
        console.error('× Check your TWITCH_USERNAME and TWITCH_PASSWORD in .env')
      }
      reject(err)
      process.exit(1)
    })

    // Message received
    client.on('message', (channel, tags, message, self) => {
      if (self) return

      // Process commands
      processCommand(client, io, channel, tags, message)
    })
  })
}

