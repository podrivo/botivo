export default function (twitch, events, channel, tags, message) {
  const args = message.trim().split(/\s+/)
  const target = args[1]

  if (!target) {
    twitch.say(channel, 'Usage: !so <channel>')
    return false
  }

  const targetLower = target.toLowerCase()
  const targetDisplay = target
  const url = `https://twitch.tv/${targetLower}`

  twitch.say(channel, `Check out @${targetDisplay} at ${url} — they're awesome!`)

  events.emit('so', { targetChannel: targetLower, displayName: targetDisplay })
  return false
}
