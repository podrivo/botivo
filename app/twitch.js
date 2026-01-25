// Imports
import tmi from 'tmi.js'
import ora from 'ora'
import { processCommand } from './commands.js'
import { CONFIG } from './config.js'

// Start Twitch client
export function startTwitch(io) {
  const spinner = ora({
    spinner: 'dots4',
    color: 'white',
    text: 'Connecting...',
    prefixText: '▒ Twitch     '
  })
  spinner.start()

  return new Promise((resolve, reject) => {
    // Trim credentials to handle whitespace issues from .env parsing
    const username = process.env.TWITCH_USERNAME?.trim() || process.env.TWITCH_USERNAME
    let password = process.env.TWITCH_PASSWORD?.trim() || process.env.TWITCH_PASSWORD
    // Automatically add 'oauth:' prefix if missing (makes it optional)
    if (password && !password.startsWith('oauth:')) {
      password = `oauth:${password}`
    }
    const channel = process.env.TWITCH_CHANNEL?.trim() || process.env.TWITCH_CHANNEL

    const silentLogger = {
      info: () => {},     // ← ignore info messages (most spam comes from here)
      warn: () => {},     // ← usually safe to silence
      error: () => {},    // ← you can keep this one if you want real errors
      // Some parts might call .log too → cover it just in case
      log:   () => {}
    };

    const client = new tmi.Client({
      options: {
        debug: true
      },
      connection: {
        reconnect: CONFIG.twitchReconnect
      },
      identity: {
        username: username,
        password: password
      },
      channels: [channel],
      logger: silentLogger
    })

    let connectionTimeout
    let isResolved = false

    client.on('connected', () => {
      if (connectionTimeout) clearTimeout(connectionTimeout)
      if (isResolved) return
      isResolved = true

      spinner.stop()
      process.stdout.write(`\r\x1b[K▒ Twitch      ✓ Connected to channel '${channel}', with user '${username}'\n`)

      resolve(client)
    })
    // client.on('disconnected', () => {console.error(`▒ Twitch disconnected`)})

    // Set connection timeout (10 seconds)
    connectionTimeout = setTimeout(() => {
      if (isResolved) return
      isResolved = true
      spinner.stop()
      const errorMsg = 'Twitch connection timeout. Check your TWITCH_USERNAME and TWITCH_PASSWORD in .env (make sure password has no extra spaces)'
      process.stdout.write(`\r\x1b[K▒ Twitch      × ERROR: ${errorMsg}\n`)
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
        process.stdout.write(`\r\x1b[K▒ Twitch      × ERROR: Failed to connect to Twitch. Check your TWITCH_USERNAME and TWITCH_PASSWORD in .env\n`)
      } else {
        process.stdout.write(`\r\x1b[K▒ Twitch      × ERROR: Failed to connect to Twitch:\n`, errMessage)
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

