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
        // Get command config from config.js, or use defaults if not found
        let commandConfig = {}
        try {
          const configModule = await import(`../commands/${commandName}/config.js`)
          commandConfig = configModule.config || {}
        } catch (configErr) {
          // config.js doesn't exist, use default config (no level restriction, use global cooldown)
          commandConfig = {
            // No level restriction - everyone can use (default behavior)
            // cooldown will use CONFIG.cooldownGlobal if not specified
          }
        }
        // Store handler with command name and config for auto socket emission
        commands[trigger] = { handler, commandName, config: commandConfig }
        loadedCommands.push(trigger)
        
        // Register aliases if configured
        if (commandConfig.alias) {
          // Normalize alias to array (handle both string and array)
          const aliases = Array.isArray(commandConfig.alias) 
            ? commandConfig.alias 
            : [commandConfig.alias]
          
          // Register each alias as an additional trigger
          for (const alias of aliases) {
            if (alias && typeof alias === 'string') {
              const aliasTrigger = `${CONFIG.prefix}${alias.toLowerCase()}`
              // Register alias with same handler and config
              commands[aliasTrigger] = { handler, commandName, config: commandConfig }
              loadedCommands.push(aliasTrigger)
            }
          }
        }
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

// Helper function to check if user has required permission level
function hasPermission(tags, requiredLevel) {
  // If no level is required, everyone can use it
  if (!requiredLevel || requiredLevel === 'viewer') {
    return true
  }
  
  // Check if user is broadcaster
  const isBroadcaster = tags.badges?.broadcaster === '1' || 
                        tags.badges?.broadcaster === 1 ||
                        tags['user-id'] === tags['room-id'] // Alternative check
  
  // Check if user is moderator
  const isModerator = tags.mod === true || 
                      tags.badges?.moderator === '1' || 
                      tags.badges?.moderator === 1 ||
                      isBroadcaster // Broadcaster is also considered a moderator
  
  // Check if user is VIP
  const isVIP = tags.badges?.vip === '1' || 
                tags.badges?.vip === 1 ||
                isModerator // Moderators and above are also considered VIP
  
  // Check if user is subscriber
  const isSubscriber = tags.subscriber === true ||
                       tags.badges?.subscriber !== undefined ||
                       isVIP // VIP and above are also considered subscribers
  
  // Permission checks (hierarchical: broadcaster > moderator > vip > subscriber > viewer)
  if (requiredLevel === 'broadcaster') {
    return isBroadcaster
  }
  
  if (requiredLevel === 'moderator') {
    return isModerator
  }
  
  if (requiredLevel === 'vip') {
    return isVIP
  }
  
  if (requiredLevel === 'subscriber') {
    return isSubscriber
  }
  
  // Unknown level, default to allowing (viewer level)
  return true
}

// Check if a message matches a command and execute it
export function processCommand(client, io, channel, tags, message) {
  const messageLower = message.toLowerCase().trim()
  
  // Check for exact match or command with arguments
  for (const [trigger, commandData] of Object.entries(commands)) {
    if (messageLower === trigger || messageLower.startsWith(trigger + ' ')) {
      const { handler, commandName, config } = commandData
      const username = tags.username || 'unknown'
      const now = Date.now()
      
      // Permission check - must come before rate limiting
      const requiredLevel = config?.level
      if (!hasPermission(tags, requiredLevel)) {
        // Silently ignore - don't spam chat with permission denied messages
        return true // Command was blocked due to permissions
      }
      
      // Rate limiting checks
      // Determine command's cooldown setting
      const commandCooldown = commandData.config?.cooldown !== undefined 
        ? commandData.config.cooldown 
        : CONFIG.cooldownGlobal
      const commandKey = `${username}_${trigger}`
      
      // If command has cooldown: 0, bypass all cooldown checks
      if (commandCooldown === 0) {
        // No cooldown for this command - skip all rate limiting checks
      } else {
        // 1. Check global cooldown (only if command doesn't have cooldown: 0)
        const timeSinceGlobalCommand = now - globalLastCommandTime
        if (timeSinceGlobalCommand < CONFIG.cooldownGlobal) {
          // Silently ignore - don't spam chat with rate limit messages
          return true // Command was rate limited
        }
        
        // 2. Check per-command per-user cooldown
        const userCommandLastTime = userLastCommandPerCommand.get(commandKey) || 0
        const timeSinceUserCommandSpecific = now - userCommandLastTime
        if (timeSinceUserCommandSpecific < commandCooldown) {
          // Silently ignore - don't spam chat with rate limit messages
          return true // Command was rate limited
        }
      }
      
      // All rate limit checks passed - execute command
      try {
        // Update rate limiting timestamps (only if command has a cooldown)
        if (commandCooldown > 0) {
          globalLastCommandTime = now
          userLastCommandPerCommand.set(commandKey, now)
        }
        
        // Clean up old entries periodically to prevent memory leak
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

