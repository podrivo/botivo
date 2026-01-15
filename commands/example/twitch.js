// Parameters:
//   - client: Twitch client instance
//   - io: Socket.IO server instance
//   - channel: Twitch channel name
//   - tags: Message tags (includes username, etc.)
//   - message: The full message text

export default function(client, io, channel, tags, message) {
  
  // Send a message chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, example command executed!`)
  
}
