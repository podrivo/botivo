// Imports
import { Server } from 'socket.io'
import ora from 'ora'

// Messages
const MESSAGE_CONNECTED    = '▒ Events      ✓ Communication with overlay started'
const MESSAGE_DISCONNECTED = '▒ Events      ✓ Disconnected from overlay. Make sure overlay is always open!'
const MESSAGE_ERROR        = '▒ Events      × ERROR: {error}'

// Start Socket.IO
export function startEvents(server, port) {
  const io = new Server(server)
  const spinner = ora({
    spinner: 'dots4',
    color: 'white',
    text: 'Waiting till overlay is open...',
    prefixText: '▒ Events     '
  })
  spinner.start()

  // Return a promise that resolves when browser connects
  return new Promise((resolve) => {
    io.on('connection', (socket) => {
      spinner.stop()
      process.stdout.write(`\r\x1b[K${MESSAGE_CONNECTED}\n`)
      
      // Resolve promise on first connection
      resolve(io)
      
      socket.on('disconnect', () => {
        spinner.stop()
        console.log(MESSAGE_DISCONNECTED)
      })

      socket.on('error', (err) => {
        spinner.stop()
        console.error(MESSAGE_ERROR.replace('{error}', err))
      })
    })
  })
}