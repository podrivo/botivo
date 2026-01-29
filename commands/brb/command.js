// Track if brb is currently active
let brbActive = false

export default function(twitch, events, channel, tags, message) {
  const messageLower = message.toLowerCase().trim()
  const isBack = messageLower === '!back'
  const isBrb = messageLower === '!brb'

  if (!isBack && !isBrb) return false

  // Either command: if active, deactivate once
  if (brbActive) {
    brbActive = false
    twitch.say(channel, 'Back to action!')
    events.emit('back')
    return false
  }

  // !back with nothing active: do nothing
  if (isBack) return false

  // !brb: activate
  brbActive = true
  twitch.say(channel, 'Be right back...')
  return
}
