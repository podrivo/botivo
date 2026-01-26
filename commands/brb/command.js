/**
 * BRB Command Handler
 * 
 * Handles !brb command and internal !back command.
 * !back can only be used after !brb has been triggered.
 * 
 * @param {Object} client - Twitch client instance (tmi.js Client)
 * @param {Object} io - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags with user info (username, display-name, mod, subscriber, badges, etc.)
 * @param {string} message - The full message text that triggered the command
 */

// Track if brb is currently active
let brbActive = false

export default function(client, io, channel, tags, message) {
  const messageLower = message.toLowerCase().trim()
  
  // Handle !brb command
  if (messageLower === '!brb') {
    if (brbActive) {
      // Already active, ignore
      return false
    }
    
    brbActive = true
    client.say(channel, 'Be right back...')
    
    return
  }
  
  // Handle internal !back command (only works if brb is active)
  // This routes to the brb handler because 'back' is an alias in config.js
  if (messageLower === '!back') {
    if (!brbActive) {
      // !back can only be used after !brb
      // Silently ignore - don't spam chat
      return false
    }
    
    brbActive = false
    client.say(channel, 'Back to action!')
    
    // Emit back event to overlay
    io.emit('back')
    
    // Return false to prevent auto-emission (we're handling it manually)
    return false
  }
  
  // If message doesn't match !brb or !back, return false
  return false
}
