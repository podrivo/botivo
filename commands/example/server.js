// Example command handler
// This function is called when someone types !example in chat
// Parameters:
//   - client: Twitch client instance
//   - io: Socket.IO server instance
//   - channel: Twitch channel name
//   - tags: Message tags (includes username, etc.)
//   - message: The full message text
//
// Note: Socket event 'example' is automatically emitted after this function runs.
//       Return false if you want to handle socket emission manually.

export default function(client, io, channel, tags, message) {
  // Socket event 'example' is automatically emitted - no need to call io.emit('example')!
  
  // Send a message back to chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, example command executed!`)
}

// Command configuration
export const config = {
  cooldown: 5000 // Cooldown in milliseconds (5 seconds). Set to 0 for no cooldown.
}