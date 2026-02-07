# OBS setup

Add the Botivo overlay to OBS Studio so your stream shows the overlay.

1. In OBS, click **+** under Sources (or **Add Source**).
2. Select **Browser** and name it (e.g. "Botivo Overlay").
3. In the URL field, enter the overlay URL (e.g. `http://localhost:8080`). Use the same URL and port shown in the terminal when you run `npm start`. If you use a different port (see `SERVER_PORT` in `.env`), use that in the URL (e.g. `http://localhost:8081`).
4. Set width and height to match your OBS canvas (e.g. 1920×1080) so overlay positioning is predictable, or use your preferred overlay size.
5. Click OK. Keep the bot running so the overlay stays available.

**Troubleshooting:** If the overlay is blank, confirm the bot is running and the URL/port match what the terminal shows. Try refreshing the browser source (right-click the source → Refresh).

For overlay commands and behavior, see [COMMANDS.md](COMMANDS.md).
