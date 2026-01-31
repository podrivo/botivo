/**
 * TTS overlay — speaks the received text using the browser's SpeechSynthesis API.
 * Called when the server emits 'tts' with (txt, lang).
 * Languages are defined in config.js; lang can be any supported code (e.g. en, br, es); default is English (en).
 */

import { ttsLanguages } from './config.js'

const TTS_BCP47_MAP = Object.fromEntries(ttsLanguages.map((l) => [l.code, l.id]))

function langPrefix(bcp47) {
  return bcp47.split('-')[0]
}

export default function (socket, txt, lang) {
  if (!txt || typeof txt !== 'string') return

  const speech = new SpeechSynthesisUtterance()
  const voices = window.speechSynthesis.getVoices()

  speech.text = txt.trim()
  speech.volume = 1
  speech.rate = 0.8
  speech.pitch = 1.25

  const bcp47 = TTS_BCP47_MAP[lang] || TTS_BCP47_MAP.en
  speech.lang = bcp47

  const prefix = langPrefix(bcp47)
  const matching = voices.filter((v) => v.lang.startsWith(prefix))
  if (matching.length > 0) {
    speech.voice = matching[0]
  }

  window.speechSynthesis.speak(speech)
}
