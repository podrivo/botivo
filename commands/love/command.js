export default function (twitch, events, channel, tags, message) {
  const displayName = tags['display-name'] || tags.username || 'unknown'

  twitch.say(channel, `We love you too, @${displayName}! <3`)

  events.emit('love', {
    username: tags.username,
    displayName
  })
  return false
}
