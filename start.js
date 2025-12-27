// Imports
import { validateEnv } from './app/dotenv.js'
import { startServer } from './app/server.js'
import { startSocket } from './app/socket.js'
import { startClient } from './app/client.js'
import { loadCommands } from './app/commands.js'

// Initialize application
(async () => {

  // Validate environment variables
  const port = validateEnv()

  // Start server (Express.js)
  const server = startServer(port)

  // Start Socket.IO
  const io = startSocket(server)

  // Load all commands
  await loadCommands()

  // Start Twitch client (tmi.js)
  startClient(io)
})()

