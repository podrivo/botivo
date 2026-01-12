// Imports
import { Server } from 'socket.io'

// Start Socket.IO
export function startEvents(server, port) {
  const io = new Server(server)
  process.stdout.write(`▒ Events      Waiting till overlay is open...`)

  // Return a promise that resolves when browser connects
  return new Promise((resolve) => {
    io.on('connection', (socket) => {
      process.stdout.write(`\r\x1b[K▒ Events      Connected to overlay\n`)
      
      // Resolve promise on first connection
      resolve(io)
      
      socket.on('disconnect', () => {
        console.log(`▒ Events      Disconnected from overlay`)
      })

      socket.on('error', (err) => {
        console.error('× Overlay error:', err)
      })
    })
  })
}