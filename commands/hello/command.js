export default function (twitch, events, channel, tags, message) {
  twitch.say(channel, `Hello, @${tags.username}!`)
}
