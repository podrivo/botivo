// Command registry
import { readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { CONFIG } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Map of command triggers to their handlers and metadata
const commands = {}
let commandsLoaded = false

// Rate limiting tracking
const userLastCommandTime = new Map() // Map<username, timestamp>
const userLastCommandPerCommand = new Map() // Map<username_command, timestamp>
let globalLastCommandTime = 0

// Helper function to scan command directories
function scanCommandDirectories() {
  const commandsDir = join(__dirname, '..', CONFIG.folderCommands)
  try {
    return readdirSync(commandsDir)
      .map(entry => join(commandsDir, entry))
      .filter(entryPath => statSync(entryPath).isDirectory())
      .map(entryPath => entryPath.split(/[/\\]/).pop())
  } catch (err) {
    console.error('▒ Commands    × ERROR: Error scanning commands directory:', err.message)
    process.exit(1)
    return []
  }
}

// Automatically load all command files from the commands directory
export async function startCommands() {
  if (commandsLoaded) return
  
  const commandNames = scanCommandDirectories()
  const loadedCommands = []
  
  for (const commandName of commandNames) {
    try {
      // Import the command module
      const commandModule = await import(`../commands/${commandName}/twitch.js`)
      
      // Derive command trigger from directory name (e.g., train -> !train)
      const trigger = `${CONFIG.prefix}${commandName}`
      
      // Find the handler function - try default export first, then named exports
      const handler = commandModule.default || 
                      commandModule.handler || 
                      commandModule[`handle${commandName.charAt(0).toUpperCase() + commandName.slice(1)}`]
      
      if (handler && typeof handler === 'function') {
        // Get command config if available
        const commandConfig = commandModule.config || {}
        // Store handler with command name and config for auto socket emission
        commands[trigger] = { handler, commandName, config: commandConfig }
        loadedCommands.push(trigger)
      } else {
        throw new Error(`No handler function found. Export a default function or a handler function.`)
      }
    } catch (err) {
      console.error(`▒ Commands    × ERROR: Error loading command ${commandName}:`, err.message)
      process.exit(1)
    }
  }
  
  // Log all loaded commands in a single message
  if (loadedCommands.length > 0) {
    console.log(`▒ Commands    ✓ Successfully loaded ${loadedCommands.length} commands`)
    // console.log(`▒ Commands: ${loadedCommands.join(', ')}`)
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
      const commandDir = join(commandsDir, commandName)
      try {
        // Read all files in the command directory
        const dirEntries = readdirSync(commandDir)
        
        // Find all files with the requested extension
        for (const entry of dirEntries) {
          if (entry.endsWith(`.${extension}`)) {
            const filePath = join(commandDir, entry)
            if (statSync(filePath).isFile()) {
              const file = {
                command: commandName,
                path: `/${CONFIG.folderCommands}/${commandName}/${entry}`
              }
              if (extension === 'html') {
                file.containerId = `${commandName}-container`
              }
              files.push(file)
            }
          }
        }
      } catch (err) {
        // Directory doesn't exist or can't be read, skip
      }
    }
  } catch (err) {
    console.error(`▒ Commands    × ERROR: Error scanning for ${extension.toUpperCase()} files:`, err.message)
    process.exit(1)
  }
  
  return files
}

// Check if a message matches a command and execute it
export function processCommand(client, io, channel, tags, message) {
  const messageLower = message.toLowerCase().trim()
  
  // Check for exact match or command with arguments
  for (const [trigger, commandData] of Object.entries(commands)) {
    if (messageLower === trigger || messageLower.startsWith(trigger + ' ')) {
      const { handler, commandName } = commandData
      const username = tags.username || 'unknown'
      const now = Date.now()
      
      // Rate limiting checks
      // 1. Check global cooldown
      const timeSinceGlobalCommand = now - globalLastCommandTime
      if (timeSinceGlobalCommand < CONFIG.cooldownGlobal) {
        // Silently ignore - don't spam chat with rate limit messages
        return true // Command was rate limited
      }
      
      // 2. Check per-user cooldown
      const userLastTime = userLastCommandTime.get(username) || 0
      const timeSinceUserCommand = now - userLastTime
      if (timeSinceUserCommand < CONFIG.cooldownUser) {
        // Silently ignore - don't spam chat with rate limit messages
        return true // Command was rate limited
      }
      
      // 3. Check per-command per-user cooldown
      const commandKey = `${username}_${trigger}`
      const userCommandLastTime = userLastCommandPerCommand.get(commandKey) || 0
      const timeSinceUserCommandSpecific = now - userCommandLastTime
      // Use command's cooldown if set, otherwise use global cooldown
      const commandCooldown = commandData.config?.cooldown ?? CONFIG.cooldownGlobal
      if (timeSinceUserCommandSpecific < commandCooldown) {
        // Silently ignore - don't spam chat with rate limit messages
        return true // Command was rate limited
      }
      
      // All rate limit checks passed - execute command
      try {
        // Update rate limiting timestamps
        globalLastCommandTime = now
        userLastCommandTime.set(username, now)
        userLastCommandPerCommand.set(commandKey, now)
        
        // Clean up old entries periodically to prevent memory leak
        if (userLastCommandTime.size > 1000) {
          // Remove entries older than 1 hour
          const oneHourAgo = now - 3600000
          for (const [user, timestamp] of userLastCommandTime.entries()) {
            if (timestamp < oneHourAgo) {
              userLastCommandTime.delete(user)
            }
          }
        }
        if (userLastCommandPerCommand.size > 1000) {
          const oneHourAgo = now - 3600000
          for (const [key, timestamp] of userLastCommandPerCommand.entries()) {
            if (timestamp < oneHourAgo) {
              userLastCommandPerCommand.delete(key)
            }
          }
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
        
        // Execute handler
        const result = handler(client, io, channel, tags, message)
        
        // Automatically emit socket event using command name (unless handler returns false)
        // This allows commands to opt-out by returning false if they want to handle emission manually
        if (result !== false) {
          io.emit(commandName)
        }
        
        return true // Command was handled
      } catch (err) {
        console.error(`▒ Commands    × ERROR: Error executing command ${trigger}:`, err.message)
        return true // Command was attempted but failed
      }
    }
  }
  
  return false // No command matched
}

