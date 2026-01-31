export default function (twitch, events, channel, tags, message) {

  const discordUrl = 'https://discord.gg/your-invite'
  const discordMessage = `Join our Discord: ${discordUrl}`

  // Send message to chat
  twitch.say(channel, discordMessage)
}
