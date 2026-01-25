/**
 * Music Command Handler
 * 
 * Handles music-related commands for YouTube video playback:
 * - !music <youtube-url> - Add video to queue
 * - !music play - Resume playback
 * - !music pause - Pause playback
 * - !music next - Skip to next video in queue
 * - !music vol <0-100> - Set volume
 * - !music zoom - Toggle zoom mode
 * - !music queue - Show queue size in chat
 * 
 * @param {Object} client - Twitch client instance (tmi.js Client)
 * @param {Object} io - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags with user info (username, display-name, mod, subscriber, badges, etc.)
 * @param {string} message - The full message text that triggered the command
 */

// ============================================================================
// Constants
// ============================================================================

const VOLUME_MIN = 0
const VOLUME_MAX = 100
const COMMAND_NAME = 'music'
const SOCKET_EVENT_QUEUE = 'queue'
const MESSAGE_USAGE = 'Use !music youtube-link, !music pause, !music next, !music vol 0-100, !music queue'
const MESSAGE_VOLUME = 'Volume set to {volume}'
const MESSAGE_VOLUME_USAGE = 'Use \'!music vol 0-100\''
const MESSAGE_QUEUE_SIZE_SINGULAR = '[1] song in queue'
const MESSAGE_QUEUE_SIZE_PLURAL = '[{size}] songs in queue'

// ============================================================================
// Queue Listener Setup (for responding to queue size requests)
// ============================================================================

let twitchClient = null
let twitchChannel = null
let isQueueListenerSetup = false

/**
 * Sets up the queue event listener to respond to queue size requests from overlay
 * Uses lazy initialization - only sets up once on first command call
 */
function setupQueueListener(io, client, channel) {
  if (isQueueListenerSetup) return
  
  twitchClient = client
  twitchChannel = channel
  isQueueListenerSetup = true
  
  /**
   * Handles queue size requests from overlay
   * Responds in chat with the current queue size
   */
  function handleQueueSizeRequest(queueData) {
    if (!twitchClient || !twitchChannel || !Array.isArray(queueData)) {
      return
    }
    
    const queueSize = queueData.length
    const message = queueSize === 1 
      ? MESSAGE_QUEUE_SIZE_SINGULAR
      : MESSAGE_QUEUE_SIZE_PLURAL.replace('{size}', queueSize)
    
    twitchClient.say(twitchChannel, message)
  }
  
  // Attach listener to all existing connected sockets
  io.sockets.sockets.forEach((socket) => {
    socket.on(SOCKET_EVENT_QUEUE, handleQueueSizeRequest)
  })
  
  // Attach listener to future connections
  io.on('connection', (socket) => {
    socket.on(SOCKET_EVENT_QUEUE, handleQueueSizeRequest)
  })
}

// ============================================================================
// YouTube URL Parsing
// ============================================================================

/**
 * Supported YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://www.youtu.be/VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * 
 * @param {string} input - YouTube URL or video ID
 * @returns {string|null} - Extracted video ID or null if invalid
 */
function extractYouTubeVideoId(input) {
  // If input is already a video ID (11 characters, alphanumeric + hyphens/underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input
  }
  
  try {
    const url = new URL(input)
    const hostname = url.hostname.replace('www.', '')
    
    // Standard YouTube URL: youtube.com/watch?v=VIDEO_ID
    if (hostname === 'youtube.com' && url.searchParams.has('v')) {
      return url.searchParams.get('v')
    }
    
    // Short YouTube URL: youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      return url.pathname.slice(1) // Remove leading slash
    }
  } catch (error) {
    // Invalid URL format
    return null
  }
  
  return null
}

// ============================================================================
// Command Parsing & Validation
// ============================================================================

/**
 * Parses command arguments from the message
 * @param {string} message - Full command message
 * @returns {{command: string|null, volume: number|null, rawArgs: string[]}}
 */
function parseCommandArgs(message) {
  const args = message.trim().split(/\s+/)
  const command = args[1]?.toLowerCase() || null
  const volumeArg = args[2] ? parseInt(args[2], 10) : null
  
  return {
    command,
    volume: volumeArg,
    rawArgs: args
  }
}

/**
 * Validates volume value
 * @param {number} volume - Volume to validate
 * @returns {boolean} - True if valid
 */
function isValidVolume(volume) {
  return volume !== null && !isNaN(volume) && volume >= VOLUME_MIN && volume <= VOLUME_MAX
}

// ============================================================================
// Command Handlers
// ============================================================================

/**
 * Commands that don't require additional parameters
 */
const SIMPLE_COMMANDS = ['play', 'pause', 'next', 'zoom', 'queue']

/**
 * Handles volume command
 * Assumes volume has already been validated
 */
function handleVolumeCommand(io, client, channel, volume) {
  io.emit(COMMAND_NAME, 'vol', volume)
  client.say(channel, MESSAGE_VOLUME.replace('{volume}', volume))
}

/**
 * Handles adding a video to the queue
 */
function handleQueueAddCommand(io, client, channel, videoUrl) {
  const videoId = extractYouTubeVideoId(videoUrl)
  
  if (!videoId) {
    client.say(channel, MESSAGE_USAGE)
    return
  }
  
  io.emit(COMMAND_NAME, null, videoId)
}

/**
 * Handles simple commands (play, pause, next, zoom, queue)
 */
function handleSimpleCommand(io, command) {
  io.emit(COMMAND_NAME, command)
}

// ============================================================================
// Main Command Handler
// ============================================================================

export default function(client, io, channel, tags, message) {
  // Setup queue listener on first call (lazy initialization)
  setupQueueListener(io, client, channel)
  
  const { command, volume, rawArgs } = parseCommandArgs(message)
  
  // No arguments provided - show usage
  if (rawArgs.length === 1) {
    client.say(channel, MESSAGE_USAGE)
    return false
  }
  
  // Handle volume command
  if (command === 'vol') {
    if (isValidVolume(volume)) {
      handleVolumeCommand(io, client, channel, volume)
    } else {
      client.say(channel, MESSAGE_VOLUME_USAGE)
    }
    return false
  }
  
  // Handle simple commands (play, pause, next, zoom, queue)
  if (SIMPLE_COMMANDS.includes(command)) {
    handleSimpleCommand(io, command)
    return false
  }
  
  // Default: treat as YouTube URL to add to queue
  handleQueueAddCommand(io, client, channel, rawArgs[1])
  
  // Return false to prevent auto-emission of 'music' event
  // We handle emission manually above with specific parameters
  return false
}
