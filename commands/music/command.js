/**
 * Command handler function
 * @param {Object} client - Twitch client instance (tmi.js Client)
 * @param {Object} io - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags with user info (username, display-name, mod, subscriber, badges, etc.)
 * @param {string} message - The full message text that triggered the command
 */

// Store references for queue event handler
let twitchClient = null
let twitchChannel = null
let queueListenerSetup = false

// Setup queue event listener (lazy initialization on first command call)
function setupQueueListener(io, client, channel) {
  if (queueListenerSetup) return
  
  twitchClient = client
  twitchChannel = channel
  queueListenerSetup = true
  
  // Handler function for queue events
  function handleQueueEvent(data) {
    if (twitchClient && twitchChannel && Array.isArray(data)) {
      const queueSize = data.length
      if (queueSize === 1) {
        twitchClient.say(twitchChannel, `[1] song in queue`)
      } else {
        twitchClient.say(twitchChannel, `[${queueSize}] songs in queue`)
      }
    }
  }
  
  // Attach listener to all existing connected sockets
  io.sockets.sockets.forEach((socket) => {
    socket.on('queue', handleQueueEvent)
  })
  
  // Attach listener to future connections
  io.on('connection', (socket) => {
    socket.on('queue', handleQueueEvent)
  })
}

// Helper function to extract YouTube video ID from URL
function getMusicId(input) {
  try {
    const url = new URL(input)

    if ((url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') && url.searchParams.has('v')) {
      return url.searchParams.get('v')
    } else if (url.hostname === 'www.youtu.be' || url.hostname === 'youtu.be') {
      return url.pathname.substr(1)
    }
  } catch (error) {
    // Invalid URL, return null
  }
  return null
}

export default function(client, io, channel, tags, message) {
  // Setup queue listener on first call (lazy initialization)
  setupQueueListener(io, client, channel)
  
  const args = message.split(' ')
  const musicCommand = args[1] ? args[1].toLowerCase() : null

  if (args.length === 1) {
    client.say(channel, 'Use \'!music youtube-link\'')
  } else {
    switch (musicCommand) {
      case 'play':
      case 'pause':
      case 'next':
      case 'zoom':
      case 'queue':
        io.emit('music', musicCommand)
        break

      case 'vol':
        const volume = parseInt(args[2])

        if (!isNaN(volume) && volume >= 0 && volume <= 100) {
          io.emit('music', musicCommand, volume)
          client.say(channel, `Volume set to ${volume}`)
        } else {
          client.say(channel, 'Use \'!music vol 0-100\'')
        }
        break

      default:
        const musicId = getMusicId(args[1])

        if (musicId) {
          io.emit('music', musicCommand, musicId)
          // Optionally announce in chat: client.say(channel, `[${musicId}] ADDED TO QUEUE`)
        } else {
          client.say(channel, 'Use \'!music youtube-link\'')
        }
        break
    }
  }

  // Return false to prevent auto-emission of 'music' event
  // We handle emission manually above with specific parameters
  return false
}
