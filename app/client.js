// Imports
import tmi from 'tmi.js'

// Initialize Twitch client
export function startClient(io) {
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

  return client
}

