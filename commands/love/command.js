export default function (twitch, events, channel, tags, message) {

  // Get the display name of the user who triggered the command
  const displayName = tags['display-name'] || tags.username || 'unknown'

  // Send a message to chat
  twitch.say(channel, `We love you too, @${displayName}! <3`)
}
