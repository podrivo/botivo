export default function (twitch, events, channel, tags, message) {

  // Send a chat message
  twitch.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
}