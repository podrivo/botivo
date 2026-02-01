# Twitch token

Botivo needs a Twitch OAuth token so the bot can connect to chat. Use the steps below to get one.

1. Go to [https://twitchtokengenerator.com/](https://twitchtokengenerator.com/).
2. Choose the option for **Chat Login** (or equivalent for chat bot).
3. Authorize with the Twitch account you want to use as the bot.
4. Copy the generated token.
5. In the project root, open `.env` and set `TWITCH_TOKEN="your-token-here"` with the token you copied.

**Security:** Do not share the token or commit `.env`; it grants access to the bot account.

If the bot stops connecting later, the token may have expired. Generate a new token and update `TWITCH_TOKEN` in `.env`.
