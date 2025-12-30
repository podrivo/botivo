// Imports
import { Server } from 'socket.io'

// Start Socket.IO
export function startSocket(server) {
  const io = new Server(server)

  io.on('connection', (socket) => {
    console.log(`▒ Overlay connected`)

    socket.on('disconnect', () => {
      console.log(`▒ Overlay disconnected`)
    })

    socket.on('error', (err) => {
      console.error('× Overlay error:', err)
    })
  })

  return io
}