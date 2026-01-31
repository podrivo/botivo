/**
 * !tts — Text-to-speech. Say a message in the overlay using the browser's Speech Synthesis API.
 * Supported languages are defined in config.js and tuned for default macOS/Windows/Linux voices.
 * Usage: !tts <message> (default English) or !tts <lang> <message> (e.g. !tts es hola).
 */

import { ttsLanguages } from './config.js'

const TTS_CODES = ttsLanguages.map((l) => l.code)

function getUsageMessage() {
  return "Use '!tts + message' or '!tts <lang> + message'. Languages: " + TTS_CODES.join(', ')
}

export default function (twitch, events, channel, tags, message) {
  const args = message.trim().split(/\s+/)

  if (args.length === 1) {
    twitch.say(channel, getUsageMessage())
    return false
  }

  const second = args[1].toLowerCase()
  let txt
  let lang

  if (TTS_CODES.includes(second)) {
    lang = second
    txt = args.slice(2).join(' ').trim()
  } else {
    txt = args.slice(1).join(' ').trim()
  }

  if (!txt) {
    twitch.say(channel, getUsageMessage())
    return false
  }

  events.emit('tts', txt, lang)
  return false
}
