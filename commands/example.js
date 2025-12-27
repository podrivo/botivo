// Example command handler
export function handleExample(client, io, channel, tags, message) {
  // Emit train key
  io.emit('example')

  // Say in chat with error handling
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
    .catch(err => console.error('× Error sending message to chat:', err.message))
}

