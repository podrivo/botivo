// Imports
import socketIo from 'socket.io'

// Start Socket.IO
export function startSocket(server) {
  const io = socketIo(server)
  return io
}

