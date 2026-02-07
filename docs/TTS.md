# TTS (Text-to-speech)

The `!tts` command speaks text in the overlay using the browser's **Speech Synthesis API**. Which voices are available depends on the viewer's **operating system and browser** (macOS, Windows, and Linux ship different default voices). The supported language list is tuned for languages commonly present on default installs. Behavior may differ on mobile or in browsers with limited Speech Synthesis API support.

## Usage

- `!tts <message>` — speaks the message using the default (English) voice.
- `!tts <lang> <message>` — speaks the message using the voice for the given language code (e.g. `!tts es hola mundo`).

## Full list of language codes

The list is defined in `commands/tts/config.js` in the **ttsLanguages** array. Below is the default set (14 codes).

| Code | Language / variant     | BCP 47     |
|------|------------------------|------------|
| en   | English (US, default)   | en-US      |
| uk   | English (UK)           | en-GB      |
| es   | Spanish                | es-ES      |
| fr   | French                 | fr-FR      |
| de   | German                 | de-DE      |
| it   | Italian                | it-IT      |
| pt   | Portuguese (Portugal)  | pt-PT      |
| br   | Portuguese (Brazil)    | pt-BR      |
| nl   | Dutch                  | nl-NL      |
| ja   | Japanese               | ja-JP      |
| zh   | Chinese                | zh-CN      |
| ko   | Korean                 | ko-KR      |
| ru   | Russian                | ru-RU      |
| pl   | Polish                 | pl-PL      |

## How to add a language

1. Open `commands/tts/config.js`.
2. Add one entry to the **ttsLanguages** array with shape `{ code: '<code>', id: '<id>' }`.
   - **code** — short code used in chat (e.g. `es`, `de`).
   - **id** — BCP 47 language tag for Speech Synthesis (e.g. `es-ES`, `de-DE`).
3. Save the file. No changes are needed in `command.js` or `overlay.js`; they read from config.

Example: to add Turkish (`tr`), add:

```js
{ code: 'tr', id: 'tr-TR' }
```

## How to remove a language

1. Open `commands/tts/config.js`.
2. Remove the corresponding entry from the **ttsLanguages** array.
3. Save the file.

No new files are required; all customization is done in `commands/tts/config.js`.

## Troubleshooting

- **No sound:** Ensure the overlay is loaded in OBS and the browser source (or system) is not muted. The TTS runs in the overlay page, so the machine running the bot must have audio available if you hear it via OBS.
- **Wrong or missing language:** Confirm the language code is in the **ttsLanguages** array in `commands/tts/config.js` and that the OS/browser provides a voice for that BCP 47 tag (e.g. `es-ES`). Some languages may have no voice on certain systems.
