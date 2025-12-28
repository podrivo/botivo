// Command registry
import { readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Map of command triggers to their handlers
const commands = {}
let commandsLoaded = false

// Automatically load all command files from the commands directory
export async function loadCommands() {
  if (commandsLoaded) return
  
  // Path to the commands folder (one level up from /app)
  const commandsDir = join(__dirname, '..', 'commands')
  const entries = readdirSync(commandsDir)
  const loadedCommands = []
  
  for (const entry of entries) {
    const entryPath = join(commandsDir, entry)
    
    // Skip if not a directory
    if (!statSync(entryPath).isDirectory()) {
      continue
    }
    
    // Check if {command}-server.js exists in the command directory
    const serverJsPath = join(entryPath, `${entry}-server.js`)
    try {
      // Import the command module
      const commandModule = await import(`../commands/${entry}/${entry}-server.js`)
      
      // Derive command trigger from directory name (e.g., train -> !train)
      const commandName = entry
      const trigger = `!${commandName}`
      
      // Find the handler function (look for handle{CommandName} or default export)
      const handlerName = `handle${commandName.charAt(0).toUpperCase() + commandName.slice(1)}`
      const handler = commandModule[handlerName] || commandModule.default || commandModule.handler
      
      if (handler && typeof handler === 'function') {
        commands[trigger] = handler
        loadedCommands.push(trigger)
      } else {
        throw new Error(`Function "${handlerName}" is not exported`)
      }
    } catch (err) {
      console.error(`× Error loading command ${entry}:`, err.message)
    }
  }
  
  // Log all loaded commands in a single message
  if (loadedCommands.length > 0) {
    console.log(`▒ Loaded ${loadedCommands.length} commands: ${loadedCommands.join(', ')}`)
  }
  
  commandsLoaded = true
}

// Get list of HTML files in command directories
export function getCommandHtmlFiles() {
  const commandsDir = join(__dirname, '..', 'commands')
  const htmlFiles = []
  
  try {
    const entries = readdirSync(commandsDir)
    
    for (const entry of entries) {
      const entryPath = join(commandsDir, entry)
      
      // Skip if not a directory
      if (!statSync(entryPath).isDirectory()) {
        continue
      }
      
      // Check if HTML file exists (named after the command directory)
      const htmlPath = join(entryPath, `${entry}.html`)
      try {
        if (statSync(htmlPath).isFile()) {
          htmlFiles.push({
            command: entry,
            path: `/commands/${entry}/${entry}.html`,
            containerId: `${entry}-container`
          })
        }
      } catch (err) {
        // HTML file doesn't exist, skip
      }
    }
  } catch (err) {
    console.error('× Error scanning for HTML files:', err.message)
  }
  
  return htmlFiles
}

// Get list of CSS files in command directories
export function getCommandCssFiles() {
  const commandsDir = join(__dirname, '..', 'commands')
  const cssFiles = []
  
  try {
    const entries = readdirSync(commandsDir)
    
    for (const entry of entries) {
      const entryPath = join(commandsDir, entry)
      
      // Skip if not a directory
      if (!statSync(entryPath).isDirectory()) {
        continue
      }
      
      // Check if CSS file exists (named after the command directory)
      const cssPath = join(entryPath, `${entry}.css`)
      try {
        if (statSync(cssPath).isFile()) {
          cssFiles.push({
            command: entry,
            path: `/commands/${entry}/${entry}.css`
          })
        }
      } catch (err) {
        // CSS file doesn't exist, skip
      }
    }
  } catch (err) {
    console.error('× Error scanning for CSS files:', err.message)
  }
  
  return cssFiles
}

// Check if a message matches a command and execute it
export function processCommand(client, io, channel, tags, message) {
  const messageLower = message.toLowerCase().trim()
  
  // Check for exact match or command with arguments
  for (const [trigger, handler] of Object.entries(commands)) {
    if (messageLower === trigger || messageLower.startsWith(trigger + ' ')) {
      try {
        handler(client, io, channel, tags, message)
        return true // Command was handled
      } catch (err) {
        console.error(`× Error executing command ${trigger}:`, err.message)
        return true // Command was attempted but failed
      }
    }
  }
  
  return false // No command matched
}

