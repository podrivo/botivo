// Imports
import { validateEnv } from './app/env.js'
import { startServer } from './app/server.js'
import { startSocket } from './app/socket.js'
import { startClient } from './app/client.js'

// Validate environment variables
const port = validateEnv()

// Initialize server (Express.js)
const server = startServer(port)

// Initialize Socket.IO
const io = startSocket(server)

// Initialize Twitch client (tmi.js)
startClient(io)

