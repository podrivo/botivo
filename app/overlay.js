// Imports
import http from 'http'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFile } from 'fs/promises'
import { getCommandFiles } from './commands.js'
import { CONFIG } from './config.js'

// Messages
const MESSAGE_ERROR_LOADING_OVERLAY  = '\n▒ Overlay     × Error loading overlay: {error}'
const MESSAGE_ERROR_PORT_IN_USE      = '▒ Overlay     × ERROR: SERVER_PORT {port} is already in use'
const MESSAGE_ERROR_GENERIC          = '▒ Overlay     × ERROR: {error}'
const MESSAGE_ERROR_INDEX_NOT_FOUND  = '▒ Overlay     × ERROR: {error}'
const MESSAGE_SUCCESS_SERVER_RUNNING = '▒ Overlay     ✓ Server is running on http://localhost:{port}'

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Helper function to build project paths
function getProjectPath(...segments) {
  return join(__dirname, '..', ...segments)
}

// Express.js
const app = express()
const server = http.createServer(app)

// Route handler for index.html (must come before static middleware)
app.get('/', async (req, res) => {
  try {
    const htmlPath = getProjectPath(CONFIG.folderOverlay, 'index.html')
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
    console.error(MESSAGE_ERROR_LOADING_OVERLAY.replace('{error}', error))
    res.status(500).send('Error loading overlay')
  }
})

// Static files (must come after route handlers)
app.use(express.static(CONFIG.folderOverlay))
app.use(`/${CONFIG.folderCommands}`, express.static(CONFIG.folderCommands))

// Server error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(MESSAGE_ERROR_PORT_IN_USE.replace('{port}', process.env.SERVER_PORT))
  } else {
    console.error(MESSAGE_ERROR_GENERIC.replace('{error}', err))
  }
  process.exit(1)
})

// Start server
export async function startOverlay(port) {
  // Validate that index.html exists before starting the server
  const htmlPath = getProjectPath(CONFIG.folderOverlay, 'index.html')
  try {
    await readFile(htmlPath, 'utf8')
  } catch (error) {
    console.error(MESSAGE_ERROR_INDEX_NOT_FOUND.replace('{error}', error.message))
    process.exit(1)
  }
  
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(MESSAGE_SUCCESS_SERVER_RUNNING.replace('{port}', port))
      resolve(server)
    })
  })
}

export { app, server }

