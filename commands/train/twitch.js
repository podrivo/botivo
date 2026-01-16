export default function(client, io, channel, tags, message) {

  // Send a message chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
}