// Imports
import { Server } from 'socket.io'

// Start Socket.IO
export function startEvents(server) {
  const io = new Server(server)

  // Return a promise that resolves when browser connects
  return new Promise((resolve) => {
    io.on('connection', (socket) => {
      console.log(`▒ Overlay ✓`)
      
      // Resolve promise on first connection
      resolve(io)
      
      socket.on('disconnect', () => {
        console.log(`▒ Overlay disconnected`)
      })

      socket.on('error', (err) => {
        console.error('× Overlay error:', err)
      })
    })
  })
}