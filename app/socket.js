// Imports
import { Server } from 'socket.io'

// Start Socket.IO
export function startSocket(server) {
  const io = new Server(server)

  return new Promise((resolve) => {
    io.on('connection', (socket) => {
      console.log(`▒ Overlay ✓`)
      
      // Resolve on first connection
      if (!io._overlayConnected) {
        io._overlayConnected = true
        resolve(io)
      }

      socket.on('disconnect', () => {
        console.log(`▒ Overlay disconnected`)
      })

      socket.on('error', (err) => {
        console.error('× Overlay error:', err)
      })
    })
  })
}