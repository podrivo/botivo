// Imports
import socketIo from 'socket.io'

// Initialize Socket.IO
export function startSocket(server) {
  const io = socketIo(server)
  return io
}

