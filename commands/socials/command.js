const socials = {
  // twitch: 'https://twitch.tv/yourchannel',
  // twitter: 'https://twitter.com/yourhandle',
  // youtube: 'https://youtube.com/@yourchannel',
}

const socialsMessage = '' // e.g. 'Twitch: … | Twitter: … | YouTube: …' — leave empty to build from socials above

function buildMessage() {
  if (socialsMessage) return socialsMessage
  if (!socials || typeof socials !== 'object') return null
  const entries = Object.entries(socials).filter(([, url]) => url)
  if (entries.length === 0) return null
  return entries.map(([label, url]) => `${label}: ${url}`).join(' | ')
}

export default function (twitch, events, channel, tags, message) {
  const messageText = buildMessage()
  if (!messageText) {
    twitch.say(channel, 'No socials set.')
    return false
  }

  twitch.say(channel, messageText)

  const socialsForOverlay = socials && typeof socials === 'object' && Object.keys(socials).length > 0 ? socials : null
  if (socialsForOverlay) {
    events.emit('socials', { socials: socialsForOverlay })
  }
  return false
}
