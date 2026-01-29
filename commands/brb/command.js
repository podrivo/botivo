// Track if brb is currently active
let brbActive = false

export default function(twitch, events, channel, tags, message) {
  const messageLower = message.toLowerCase().trim()
  
  // Handle !brb command
  if (messageLower === '!brb') {
    if (brbActive) {
      // Already active, ignore
      return false
    }
    
    brbActive = true
    twitch.say(channel, 'Be right back...')
    
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
    twitch.say(channel, 'Back to action!')
    
    // Emit back event to overlay
    events.emit('back')
    
    // Return false to prevent auto-emission (we're handling it manually)
    return false
  }
  
  // If message doesn't match !brb or !back, return false
  return false
}
