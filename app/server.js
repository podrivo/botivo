// Imports
import http from 'http'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFile } from 'fs/promises'
import { getCommandHtmlFiles } from './commands.js'

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Express.js
const app = express()
const server = http.createServer(app)

// Route handler for index.html (must come before static middleware)
app.get('/', async (req, res) => {
  try {
    const htmlPath = join(__dirname, '..', 'overlay', 'index.html')
    let html = await readFile(htmlPath, 'utf8')
    
    // Inject command HTML files list into the page
    const htmlFiles = getCommandHtmlFiles()
    const commandListScript = `<script>window.COMMAND_HTML_FILES = ${JSON.stringify(htmlFiles)};</script>`
    html = html.replace('</head>', `${commandListScript}</head>`)
    
    res.send(html)
  } catch (error) {
    console.error('Error serving index.html:', error)
    res.status(500).send('Internal server error. Check console for details.')
  }
})

// Static files (must come after route handlers)
app.use(express.static('overlay'))
app.use('/commands', express.static('commands'))

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

