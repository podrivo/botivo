// Command registry
import { readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { CONFIG } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Map of command triggers to their command info (handler, cooldown)
const commands = {}
let commandsLoaded = false

// Cooldown tracking: Map<commandTrigger, lastExecutionTime>
const commandLastExecution = new Map()

// Helper function to scan command directories
function scanCommandDirectories() {
  const commandsDir = join(__dirname, '..', CONFIG.folderCommands)
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
      const trigger = `${CONFIG.prefix}${commandName}`
      
      // Find the handler function (look for handle{CommandName} or default export)
      const handlerName = `handle${commandName.charAt(0).toUpperCase() + commandName.slice(1)}`
      const handler = commandModule[handlerName] || commandModule.default || commandModule.handler
      
      if (handler && typeof handler === 'function') {
        // Get cooldown from command config object (default to 0 if not specified or invalid)
        const cooldown = typeof commandModule.config?.cooldown === 'number' && commandModule.config.cooldown >= 0
          ? commandModule.config.cooldown
          : 0
        
        commands[trigger] = {
          handler,
          cooldown
        }
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
    const commandsDir = join(__dirname, '..', CONFIG.folderCommands)
    
    for (const commandName of commandNames) {
      const filePath = join(commandsDir, commandName, `${commandName}.${extension}`)
      try {
        if (statSync(filePath).isFile()) {
          const file = {
            command: commandName,
            path: `/${CONFIG.folderCommands}/${commandName}/${commandName}.${extension}`
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
  for (const [trigger, commandInfo] of Object.entries(commands)) {
    if (messageLower === trigger || messageLower.startsWith(trigger + ' ')) {
      const username = tags.username || 'unknown'
      const now = Date.now()
      const { handler, cooldown } = commandInfo
      
      // Check command cooldown (if cooldown is set)
      if (cooldown > 0) {
        const lastExecution = commandLastExecution.get(trigger) || 0
        const timeSinceLastExecution = now - lastExecution
        if (timeSinceLastExecution < cooldown) {
          // Silently ignore - don't spam chat with rate limit messages
          return true // Command was rate limited
        }
      }
      
      // Cooldown check passed - execute command
      try {
        // Update last execution time
        if (cooldown > 0) {
          commandLastExecution.set(trigger, now)
        }
        
        // Log command usage
        if (CONFIG.debug) {
          const logMessage = `▒ Command used: ${trigger} by ${username}${messageLower !== trigger ? ` (${message})` : ''}`
          console.log(logMessage)
        }
        
        // Emit to overlay console
        if (CONFIG.debug) {
          io.emit('command-log', {
            command: trigger,
            username: username,
            message: message
          })
        }
        
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

