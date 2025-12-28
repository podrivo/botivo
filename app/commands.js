// Command registry
import { readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Map of command triggers to their handlers
const commands = {}
let commandsLoaded = false

// Helper function to scan command directories
function scanCommandDirectories() {
  const commandsDir = join(__dirname, '..', 'commands')
  try {
    return readdirSync(commandsDir)
      .map(entry => join(commandsDir, entry))
      .filter(entryPath => statSync(entryPath).isDirectory())
      .map(entryPath => entryPath.split(/[/\\]/).pop())
  } catch (err) {
    console.error('× Error scanning commands directory:', err.message)
    return []
  }
}

// Automatically load all command files from the commands directory
export async function loadCommands() {
  if (commandsLoaded) return
  
  const commandNames = scanCommandDirectories()
  const loadedCommands = []
  
  for (const commandName of commandNames) {
    try {
      // Import the command module
      const commandModule = await import(`../commands/${commandName}/${commandName}-server.js`)
      
      // Derive command trigger from directory name (e.g., train -> !train)
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
      console.error(`× Error loading command ${commandName}:`, err.message)
    }
  }
  
  // Log all loaded commands in a single message
  if (loadedCommands.length > 0) {
    console.log(`▒ Loaded ${loadedCommands.length} commands: ${loadedCommands.join(', ')}`)
  }
  
  commandsLoaded = true
}

// Get list of files (HTML or CSS) in command directories
export function getCommandFiles(extension) {
  const commandNames = scanCommandDirectories()
  const files = []
  
  try {
    const commandsDir = join(__dirname, '..', 'commands')
    
    for (const commandName of commandNames) {
      const filePath = join(commandsDir, commandName, `${commandName}.${extension}`)
      try {
        if (statSync(filePath).isFile()) {
          const file = {
            command: commandName,
            path: `/commands/${commandName}/${commandName}.${extension}`
          }
          if (extension === 'html') {
            file.containerId = `${commandName}-container`
          }
          files.push(file)
        }
      } catch (err) {
        // File doesn't exist, skip
      }
    }
  } catch (err) {
    console.error(`× Error scanning for ${extension.toUpperCase()} files:`, err.message)
  }
  
  return files
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

