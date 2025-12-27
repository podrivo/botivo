import { initTrainCommand } from '../commands/train/client.js'

window.onload = function() {

  // Socket.IO
  let socket = io.connect()

  // Socket.IO error handling
  socket.on('connect', () => console.log('Overlay connected to Botivo'))
  socket.on('disconnect', () => console.log('Overlay disconnected from Botivo'))
  socket.on('connect_error', (err) => console.error('Connection error:', err))

  // Initialize train command
  initTrainCommand(socket)
}
