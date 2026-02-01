export default function (twitch, events, channel, tags, message) {

  // Get the target channel from the message
  const args = message.trim().split(/\s+/)
  const target = (args[1] || '').replace(/^@/, '')

  // If no target, send a message to chat and return false
  if (!target) {
    twitch.say(channel, 'Usage: !so <channel>')
    return false
  }

  // Get the target channel in lowercase and display name
  const targetLower = target.toLowerCase()
  const targetDisplay = target
  const url = `https://twitch.tv/${targetLower}`

  // Send a message to chat
  twitch.say(channel, `Check out @${targetDisplay} at ${url}`)

  // Emit an event to the overlay
  events.emit('so', { targetChannel: targetLower, displayName: targetDisplay })

  return false
}
