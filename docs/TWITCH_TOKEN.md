# Twitch token

Botivo needs a Twitch OAuth token so the bot can connect to chat. Use the steps below to get one.

1. Go to [https://twitchtokengenerator.com/](https://twitchtokengenerator.com/).
2. Choose the option for **Chat Login** (or equivalent for chat bot).
3. Authorize with the Twitch account you want to use as the bot.
4. Copy the generated token.
5. In the project root, create or open `.env` and set `TWITCH_TOKEN="your-token-here"` with the token you copied. If the project has an `.env.example` file, copy it to `.env` and fill in `TWITCH_TOKEN` there (never commit `.env`).

You can paste the token with or without the `oauth:` prefix; Botivo will add it if missing.

**Security:** Do not share the token or commit `.env`; it grants access to the bot account.

If the bot stops connecting later, the token may have expired (tokens from twitchtokengenerator.com can expire). Generate a new token and update `TWITCH_TOKEN` in `.env`.

## Alternative: Twitch Developer Console

You can also create a token manually: create an application in the [Twitch Developer Console](https://dev.twitch.tv/console), then generate an OAuth token with chat scopes (e.g. `chat:read`, `chat:edit`) for the bot account. Use that token as `TWITCH_TOKEN` in `.env`.
