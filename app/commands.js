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

// Helper function to find handler in a module
function findHandler(module, commandName) {
  return module.default || 
         module.handler || 
         module[`handle${commandName.charAt(0).toUpperCase() + commandName.slice(1)}`]
}

// Helper function to load command config
async function loadCommandConfig(commandName) {
  try {
    const configModule = await import(`../commands/${commandName}/config.js`)
    return configModule.config || {}
  } catch {
    // config.js doesn't exist, use default config (no permission restriction, use global cooldown)
    return {}
  }
}

// Helper function to register aliases
function registerAliases(trigger, commandData, config) {
  if (!config.alias) return []
  
  const aliases = Array.isArray(config.alias) ? config.alias : [config.alias]
  const aliasTriggers = []
  
  for (const alias of aliases) {
    if (alias && typeof alias === 'string') {
      const aliasTrigger = `${CONFIG.prefix}${alias.toLowerCase()}`
      commands[aliasTrigger] = commandData
      aliasTriggers.push(aliasTrigger)
    }
  }
  
  return aliasTriggers
}

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
  const originalCommands = []
  let originalCommandCount = 0
  
  for (const commandName of commandNames) {
    try {
      // Import the command module
      const commandModule = await import(`../commands/${commandName}/command.js`)
      
      // Derive command trigger from directory name (e.g., train -> !train)
      const trigger = `${CONFIG.prefix}${commandName}`
      
      // Find the handler function
      const handler = findHandler(commandModule, commandName)
      
      if (handler && typeof handler === 'function') {
        // Get command config from config.js, or use defaults if not found
        const commandConfig = await loadCommandConfig(commandName)
        
        // Store handler with command name and config for auto socket emission
        const commandData = { handler, commandName, config: commandConfig }
        commands[trigger] = commandData
        loadedCommands.push(trigger)
        originalCommandCount++
        
        // Register aliases and get their triggers
        const aliasTriggers = registerAliases(trigger, commandData, commandConfig)
        loadedCommands.push(...aliasTriggers)
        
        // Format command display with aliases
        const commandDisplay = aliasTriggers.length > 0
          ? `${trigger} (${aliasTriggers.join(', ')})`
          : trigger
        originalCommands.push(commandDisplay)
      } else {
        throw new Error(`No handler function found. Export a default function or a handler function.`)
      }
    } catch (err) {
      console.error(`▒ Commands    × ERROR: Error loading command ${commandName}:`, err.message)
      process.exit(1)
    }
  }
  
  // Log all loaded commands in a single message
  if (originalCommandCount > 0) {
    console.log(`▒ Commands    ✓ Successfully loaded ${originalCommandCount} commands`)
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

// Permission hierarchy (from highest to lowest)
const PERMISSION_HIERARCHY = ['broadcaster', 'moderator', 'vip', 'subscriber', 'viewer']

// Helper function to get user's permission level
function getUserPermissionLevel(tags) {
  // Check if user is broadcaster
  const isBroadcaster = tags.badges?.broadcaster === '1' || 
                        tags.badges?.broadcaster === 1 ||
                        tags['user-id'] === tags['room-id']
  if (isBroadcaster) return 'broadcaster'
  
  // Check if user is moderator
  const isModerator = tags.mod === true || 
                      tags.badges?.moderator === '1' || 
                      tags.badges?.moderator === 1
  if (isModerator) return 'moderator'
  
  // Check if user is VIP
  const isVIP = tags.badges?.vip === '1' || tags.badges?.vip === 1
  if (isVIP) return 'vip'
  
  // Check if user is subscriber
  const isSubscriber = tags.subscriber === true || tags.badges?.subscriber !== undefined
  if (isSubscriber) return 'subscriber'
  
  // Default to viewer
  return 'viewer'
}

// Helper function to check if user has required permission
function hasPermission(tags, requiredPermission) {
  // If no permission is required, everyone can use it
  if (!requiredPermission || requiredPermission === 'viewer') {
    return true
  }
  
  const userLevel = getUserPermissionLevel(tags)
  const requiredIndex = PERMISSION_HIERARCHY.indexOf(requiredPermission)
  const userIndex = PERMISSION_HIERARCHY.indexOf(userLevel)
  
  // User has permission if their level is equal or higher (lower index = higher permission)
  if (requiredIndex === -1) {
    // Unknown permission, default to allowing (viewer permission)
    return true
  }
  
  return userIndex <= requiredIndex
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
      const requiredPermission = config?.permission
      if (!hasPermission(tags, requiredPermission)) {
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
      if (commandCooldown > 0) {
        // Check global cooldown
        if (now - globalLastCommandTime < CONFIG.cooldownGlobal) {
          // Silently ignore - don't spam chat with rate limit messages
          return true // Command was rate limited
        }
        
        // Check per-command per-user cooldown
        const userCommandLastTime = userLastCommandPerCommand.get(commandKey) || 0
        if (now - userCommandLastTime < commandCooldown) {
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
        const logMessage = `▒ Command used: ${trigger} by ${username}${messageLower !== trigger ? ` (${message})` : ''}`
        console.log(logMessage)
        
        // Emit to overlay console
        io.emit('command-log', {
          command: trigger,
          username: username,
          message: message
        })
        
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

// Get list of all loaded commands with their aliases
export function getCommandsList() {
  const commandNames = scanCommandDirectories()
  const commandsWithAliases = []
  
  for (const commandName of commandNames) {
    const trigger = `${CONFIG.prefix}${commandName}`
    const commandData = commands[trigger]
    
    if (commandData) {
      const config = commandData.config || {}
      const aliases = config.alias || []
      
      // Format aliases with prefix
      const aliasTriggers = Array.isArray(aliases) 
        ? aliases.map(alias => `${CONFIG.prefix}${alias.toLowerCase()}`)
        : aliases ? [`${CONFIG.prefix}${aliases.toLowerCase()}`] : []
      
      commandsWithAliases.push({
        trigger,
        aliases: aliasTriggers
      })
    }
  }
  
  // Sort by trigger
  return commandsWithAliases.sort((a, b) => a.trigger.localeCompare(b.trigger))
}

