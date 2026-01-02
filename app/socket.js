// Imports
import { Server } from 'socket.io'

// Start Socket.IO
export function startSocket(server) {
  const io = new Server(server)

  // Set up connection handlers (but don't wait for connection)
  io.on('connection', (socket) => {
    console.log(`▒ Overlay ✓`)
    
    socket.on('disconnect', () => {
      console.log(`▒ Overlay disconnected`)
    })

    socket.on('error', (err) => {
      console.error('× Overlay error:', err)
    })
  })

  // Resolve immediately - don't wait for browser connection
  return Promise.resolve(io)
}