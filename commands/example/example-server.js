// Example command handler
// This function is called when someone types !example in chat
// Parameters:
//   - client: Twitch client instance
//   - io: Socket.IO server instance
//   - channel: Twitch channel name
//   - tags: Message tags (includes username, etc.)
//   - message: The full message text

export function handleExample(client, io, channel, tags, message) {

  // Emit an event to trigger the overlay animation
  io.emit('example')

  // Send a message back to chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, example command executed!`)
}

// Command configuration
export const config = {
  cooldown: 5000 // Cooldown in milliseconds (5 seconds). Set to 0 for no cooldown.
}