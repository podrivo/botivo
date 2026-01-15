// Train command handler

// Command configuration
export const config = {
  cooldown: 1000
}

export function handleTrain(client, io, channel, tags, message) {
  // Emit train key
  io.emit('train')

  // Say in chat with error handling
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
    .catch(err => console.error('× Error sending message to chat:', err.message))
}

