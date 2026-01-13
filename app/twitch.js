// Imports
import tmi from 'tmi.js'
import { processCommand } from './commands.js'
import { CONFIG } from './config.js'

// Start Twitch client
export function startTwitch(io) {
  return new Promise((resolve, reject) => {
    // Trim credentials to handle whitespace issues from .env parsing
    const username = process.env.TWITCH_USERNAME?.trim() || process.env.TWITCH_USERNAME
    const password = process.env.TWITCH_PASSWORD?.trim() || process.env.TWITCH_PASSWORD
    const channel = process.env.TWITCH_CHANNEL?.trim() || process.env.TWITCH_CHANNEL

    const client = new tmi.Client({
      options: {
        debug: CONFIG.debug
      },
      connection: {
        reconnect: CONFIG.twitchReconnect
      },
      identity: {
        username: username,
        password: password
      },
      channels: [channel]
    })

    let connectionTimeout
    let isResolved = false

    client.on('connected', () => {
      if (connectionTimeout) clearTimeout(connectionTimeout)
      if (isResolved) return
      isResolved = true
      console.log(`▒ Twitch      ✓ Connected to channel ${channel}, with user ${username}`)
      resolve(client)
    })
    // client.on('disconnected', () => {console.error(`▒ Twitch disconnected`)})

    // Set connection timeout (10 seconds)
    connectionTimeout = setTimeout(() => {
      if (isResolved) return
      isResolved = true
      const errorMsg = 'Twitch connection timeout. Check your TWITCH_USERNAME and TWITCH_PASSWORD in .env (make sure password has no extra spaces and starts with "oauth:"'
      console.error(`▒ Twitch      × ERROR: ${errorMsg}`)
      client.disconnect()
      reject(new Error(errorMsg))
      process.exit(1)
    }, 10000)

    client.connect().catch((err) => {
      if (connectionTimeout) clearTimeout(connectionTimeout)
      if (isResolved) return
      isResolved = true
      const errMessage = err?.message || err?.toString() || String(err)
      if (errMessage.includes('Login authentication failed')) {
        console.error('▒ Twitch      × ERROR: Failed to connect to Twitch. Check your TWITCH_USERNAME and TWITCH_PASSWORD in .env')
      } else {
        console.error('▒ Twitch      × ERROR: Failed to connect to Twitch:', errMessage)
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

