export default function(client, io, channel, tags, message) {

  // Send a chat message
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
}