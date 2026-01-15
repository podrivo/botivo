export default function(client, io, channel, tags, message) {

  // Say in chat with error handling
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
    .catch(err => console.error('× Error sending message to chat:', err.message))
}

export const config = {
  cooldown: 1000
}