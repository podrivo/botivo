const discordUrl = 'https://discord.gg/your-invite'
const discordMessage = `Join our Discord: ${discordUrl}`

export default function (twitch, events, channel, tags, message) {
  const url = discordUrl
  const messageText = discordMessage

  twitch.say(channel, messageText)

  if (url) {
    events.emit('discord', { discordUrl: url })
  }
  return false
}
