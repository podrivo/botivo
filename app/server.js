// Imports
import http from 'http'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Express.js
const app = express()
const server = http.createServer(app)

// Static files
app.use(express.static('overlay'))
app.use('/commands', express.static('commands'))
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'overlay', 'index.html'))
})

// Server error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`× Port ${process.env.SERVER_PORT} is already in use`)
  } else {
    console.error('× Server error:', err)
  }
  process.exit(1)
})

// Start server
export function startServer(port) {
  server.listen(port, () => {
    console.log(`█ Botivo started`)
    console.log(`▒ Your overlay URL is: http://localhost:${port}`)
  })
  
  return server
}

export { app, server }

