// Imports
import { Server } from 'socket.io'

// Start Socket.IO
export function startSocket(server) {
  const io = new Server(server)
  return io
}

