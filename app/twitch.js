// Imports
import tmi from 'tmi.js'
import ora from 'ora'
import { processCommand } from './commands.js'
import { CONFIG } from './config.js'

// Messages
const MESSAGE_SUCCESS_CONNECTED        = '▒ Twitch      ✓ Connected to channel \'{channel}\', with user \'{username}\''
const MESSAGE_ERROR_CONNECTION_TIMEOUT = '▒ Twitch      × ERROR: {error}'
const MESSAGE_ERROR_LOGIN_FAILED       = '▒ Twitch      × ERROR: Failed to connect to Twitch. Check your TWITCH_USERNAME and TWITCH_TOKEN in .env'
const MESSAGE_ERROR_CONNECTION_FAILED  = '▒ Twitch      × ERROR: Failed to connect to Twitch:\n{error}'

// Helper function to get environment variable with trimming
function getEnvVar(name, transform = null) {
  const value = process.env[name]?.trim() || process.env[name]
  return transform ? transform(value) : value
}

// Start Twitch client
export function startTwitch(events) {
  const spinner = ora({
    spinner: 'dots4',
    color: 'white',
    text: 'Connecting...',
    prefixText: '▒ Twitch     '
  })
  spinner.start()

  return new Promise((resolve, reject) => {
    // Trim credentials to handle whitespace issues from .env parsing
    const username = getEnvVar('TWITCH_USERNAME')
    const password = getEnvVar('TWITCH_TOKEN', (pwd) => {
      // Automatically add 'oauth:' prefix if missing (makes it optional)
      return pwd && !pwd.startsWith('oauth:') ? `oauth:${pwd}` : pwd
    })
    const channel = getEnvVar('TWITCH_CHANNEL')

    const silentLogger = {
      info: () => {},     // ← ignore info messages (most spam comes from here)
      warn: () => {},     // ← usually safe to silence
      error: () => {},    // ← you can keep this one if you want real errors
      // Some parts might call .log too → cover it just in case
      log:   () => {}
    };

    const twitch = new tmi.Client({
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

    twitch.on('connected', () => {
      if (connectionTimeout) clearTimeout(connectionTimeout)
      if (isResolved) return
      isResolved = true

      spinner.stop()
      process.stdout.write(`\r\x1b[K${MESSAGE_SUCCESS_CONNECTED.replace('{channel}', channel).replace('{username}', username)}\n`)

      resolve(twitch)
    })
    // client.on('disconnected', () => {console.error(`▒ Twitch disconnected`)})

    // Set connection timeout (10 seconds)
    connectionTimeout = setTimeout(() => {
      if (isResolved) return
      isResolved = true
      spinner.stop()
      const errorMsg = 'Twitch connection timeout. Check your TWITCH_USERNAME and TWITCH_TOKEN in .env (make sure password has no extra spaces)'
      process.stdout.write(`\r\x1b[K${MESSAGE_ERROR_CONNECTION_TIMEOUT.replace('{error}', errorMsg)}\n`)
      twitch.disconnect()
      reject(new Error(errorMsg))
      process.exit(1)
    }, 10000)

    twitch.connect().catch((err) => {
      if (connectionTimeout) clearTimeout(connectionTimeout)
      if (isResolved) return
      isResolved = true
      const errMessage = err?.message || err?.toString() || String(err)
      if (errMessage.includes('Login authentication failed')) {
        process.stdout.write(`\r\x1b[K${MESSAGE_ERROR_LOGIN_FAILED}\n`)
      } else {
        process.stdout.write(`\r\x1b[K${MESSAGE_ERROR_CONNECTION_FAILED.replace('{error}', errMessage)}`)
      }
      reject(err)
      process.exit(1)
    })

    // Message received
    twitch.on('message', (channel, tags, message, self) => {
      if (self) return

      // Process commands
      processCommand(twitch, events, channel, tags, message)
    })
  })
}

