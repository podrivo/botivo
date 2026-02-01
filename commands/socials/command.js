export default function (twitch, events, channel, tags, message) {
  const socials = {
    Twitch: 'twitch.tv/username',
    Twitter: 'twitter.com/username',
    Youtube: 'youtube.com/@username',
  }

  const socialsMessage = '' // e.g. 'Twitch: … | Twitter: … | YouTube: …' — leave empty to build from socials above

  function buildMessage() {
    if (socialsMessage) return socialsMessage
    if (!socials || typeof socials !== 'object') return null
    const entries = Object.entries(socials).filter(([, url]) => url)
    if (entries.length === 0) return null
    const list = entries.map(([label, url]) => `${label}: ${url}`).join(' / ')
    return `Follow me on ${list}`
  }

  const messageText = buildMessage()
  if (!messageText) {
    twitch.say(channel, 'No socials set.')
    return false
  }

  // Send a message to chat
  twitch.say(channel, messageText)
}
