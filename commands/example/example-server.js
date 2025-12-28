// Example command handler
// This function is called when someone types !example in chat
// Parameters:
//   - client: Twitch client instance
//   - io: Socket.IO server instance
//   - channel: Twitch channel name
//   - tags: Message tags (includes username, etc.)
//   - message: The full message text
export function handleExample(client, io, channel, tags, message) {
  // Emit a socket event to trigger the overlay animation
  io.emit('example')

  // Optionally send a message back to chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, example command executed!`)
    .catch(err => console.error('× Error sending message to chat:', err.message))
}

