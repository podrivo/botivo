/**
 * TTS language list — single source of truth for !tts command.
 * Add or remove entries here; command.js and overlay.js use this list.
 * Tuned for languages commonly available on default macOS, Windows, and Linux installs.
 */
export const ttsLanguages = [
  { code: 'en', id: 'en-US' },
  { code: 'uk', id: 'en-GB' },
  { code: 'es', id: 'es-ES' },
  { code: 'fr', id: 'fr-FR' },
  { code: 'de', id: 'de-DE' },
  { code: 'it', id: 'it-IT' },
  { code: 'pt', id: 'pt-PT' },
  { code: 'br', id: 'pt-BR' },
  { code: 'nl', id: 'nl-NL' },
  { code: 'ja', id: 'ja-JP' },
  { code: 'zh', id: 'zh-CN' },
  { code: 'ko', id: 'ko-KR' },
  { code: 'ru', id: 'ru-RU' },
  { code: 'pl', id: 'pl-PL' }
]

export const config = {
  cooldown: 0
}
