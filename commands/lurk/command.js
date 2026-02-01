export default function (twitch, events, channel, tags, message) {
  const displayName = tags['display-name'] || tags.username || 'unknown'

  // Send a message to chat
  twitch.say(channel, `@${displayName} is lurking in the shadows. Thanks for still being here!`)

  events.emit('lurk', {
    username: tags.username,
    displayName
  })
  return false
}
