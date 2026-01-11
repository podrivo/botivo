// Imports
import http from 'http'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFile } from 'fs/promises'
import { getCommandFiles } from './commands.js'
import { CONFIG } from './config.js'

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Express.js
const app = express()
const server = http.createServer(app)

// Route handler for index.html (must come before static middleware)
app.get('/', async (req, res) => {
  try {
    const htmlPath = join(__dirname, '..', CONFIG.folderOverlay, 'index.html')
    let html = await readFile(htmlPath, 'utf8')
    
    // Inject command HTML files list into the page
    const htmlFiles = getCommandFiles('html')
    const commandListScript = `<script>window.COMMAND_HTML_FILES = ${JSON.stringify(htmlFiles)};</script>`
    html = html.replace('</head>', `${commandListScript}</head>`)
    
    // Inject command CSS files automatically
    const cssFiles = getCommandFiles('css')
    const cssLinks = cssFiles.map(css => 
      `<link rel="stylesheet" href="${css.path}">`
    ).join('\n    ')
    if (cssLinks) {
      html = html.replace('</head>', `    ${cssLinks}\n  </head>`)
    }
    
    res.send(html)
  } catch (error) {
    console.error('× Error loading overlay:', error)
    res.status(500).send('Internal server error. Check logs for details.')
  }
})

// Static files (must come after route handlers)
app.use(express.static(CONFIG.folderOverlay))
app.use(`/${CONFIG.folderCommands}`, express.static(CONFIG.folderCommands))

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
export function startOverlay(port) {
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`▒ Overlay   http://localhost:${port}`)
      resolve(server)
    })
  })
}

export { app, server }

