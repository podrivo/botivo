# OBS setup

Add the Botivo overlay to OBS Studio so your stream shows the overlay.

1. In OBS, click **+** under Sources (or **Add Source**).
2. Select **Browser** and name it (e.g. "Botivo Overlay").
3. In the URL field, enter the overlay URL (e.g. `http://localhost:8080`). Use the same URL and port shown in the terminal when you run `npm start`, or the port from `SERVER_PORT` in `.env`.
4. Set width and height (e.g. 1920×1080 to match your canvas, or your preferred overlay size).
5. Click OK. Keep the bot running so the overlay stays available.

If you use a different port in `.env`, use that in the URL (e.g. `http://localhost:8081`).
