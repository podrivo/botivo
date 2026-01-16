// Imports
import { Server } from 'socket.io'
import ora from 'ora'

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
      process.stdout.write(`\r\x1b[K▒ Events      ✓ Communication with overlay started\n`)
      
      // Resolve promise on first connection
      resolve(io)
      
      socket.on('disconnect', () => {
        spinner.stop()
        console.log(`▒ Events      Disconnected from overlay. Make sure overlay is always open!`)
      })

      socket.on('error', (err) => {
        spinner.stop()
        console.error('▒ Events      × ERROR:', err)
      })
    })
  })
}