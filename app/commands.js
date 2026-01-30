// Command registry
import { readdirSync, statSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { basename, dirname, join } from 'path'
import { CONFIG } from './config.js'

// Messages
const MESSAGE_ERROR_SCANNING_DIRECTORY = '▒ Commands    × ERROR: Error scanning commands directory: {error}'
const MESSAGE_ERROR_LOADING_COMMAND    = '▒ Commands    × ERROR: Error loading command {commandName}: {error}'
const MESSAGE_SUCCESS_LOADED_COMMANDS  = '▒ Commands    ✓ Successfully loaded {countCustom} custom and {countDefault} built-in commands'
const MESSAGE_ERROR_SCANNING_FILES     = '▒ Commands    × ERROR: Error scanning for {extension} files: {error}'
const MESSAGE_COMMAND_USED             = '▒ Commands    ✓ {trigger} by {username}{message}'
const MESSAGE_ERROR_EXECUTING_COMMAND  = '▒ Commands    × ERROR: Error executing command {trigger}: {error}'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Map of command triggers to their handlers and metadata
const commands = {}
let commandsLoaded = false

// Built-in (default) commands (registered from this file)
const defaultCommands = []

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

function registerDefaultCommand(commandName, handler, config = {}) {
  const trigger = `${CONFIG.prefix}${commandName}`
  const commandData = { handler, commandName, config }

  // Check if command is active (defaults to true if not set)
  if (config?.active === false) {
    return
  }

  commands[trigger] = commandData
  const aliasTriggers = registerAliases(trigger, commandData, config)

  defaultCommands.push({
    trigger,
    aliases: aliasTriggers,
    permission: config?.permission
  })
}

// Load built-in commands from app/cmd-*.js files (e.g. cmd-kill.js, cmd-commands.js)
async function loadBuiltInCmdFiles() {
  const appDir = __dirname
  const entries = readdirSync(appDir)
  const cmdFiles = entries
    .filter(name => name.startsWith('cmd-') && name.endsWith('.js'))
    .sort()
  for (const file of cmdFiles) {
    const modulePath = join(appDir, file)
    const commandName = basename(file, '.js').replace(/^cmd-/, '')
    try {
      const mod = await import(pathToFileURL(modulePath).href)
      const handler = mod.handler || mod.default
      const config = mod.config ?? CONFIG.defaultCommands?.[commandName] ?? {}
      if (typeof handler === 'function') {
        registerDefaultCommand(commandName, handler, config)
      }
    } catch (err) {
      console.error(MESSAGE_ERROR_LOADING_COMMAND.replace('{commandName}', file).replace('{error}', err.message))
      process.exit(1)
    }
  }
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
    console.error(MESSAGE_ERROR_SCANNING_DIRECTORY.replace('{error}', err.message))
    process.exit(1)
    return []
  }
}

// Automatically load all command files from the commands directory
export async function startCommands() {
  if (commandsLoaded) return
  
  // Register built-in (default) commands from app/cmd-*.js files first
  await loadBuiltInCmdFiles()

  const commandNames = scanCommandDirectories()
  const loadedCommands = []
  const originalCommands = []
  let originalCommandCount = 0
  
  for (const commandName of commandNames) {
    // Skip if this command is already registered as a built-in (app/cmd-*.js)
    const trigger = `${CONFIG.prefix}${commandName}`
    if (defaultCommands.some(dc => dc.trigger === trigger)) continue

    try {
      // Import the command module
      const commandModule = await import(`../commands/${commandName}/command.js`)
      
      // Find the handler function
      const handler = findHandler(commandModule, commandName)
      
      if (handler && typeof handler === 'function') {
        // Get command config from config.js, or use defaults if not found
        const commandConfig = await loadCommandConfig(commandName)
        
        // Check if command is active (defaults to true if not set)
        if (commandConfig.active === false) {
          // Skip inactive commands - don't register them
          continue
        }
        
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
      console.error(MESSAGE_ERROR_LOADING_COMMAND.replace('{commandName}', commandName).replace('{error}', err.message))
      process.exit(1)
    }
  }
  
  // Log all loaded commands in a single message
  const countDefault = defaultCommands.length
  if (originalCommandCount > 0 || countDefault > 0) {
    console.log(MESSAGE_SUCCESS_LOADED_COMMANDS
      .replace('{countCustom}', originalCommandCount)
      .replace('{countDefault}', countDefault))
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
    console.error(MESSAGE_ERROR_SCANNING_FILES.replace('{extension}', extension.toUpperCase()).replace('{error}', err.message))
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
export function processCommand(twitch, events, channel, tags, message) {
  const messageLower = message.toLowerCase().trim()
  
  // Check for exact match or command with arguments
  for (const [trigger, commandData] of Object.entries(commands)) {
    if (messageLower === trigger || messageLower.startsWith(trigger + ' ')) {
      const { handler, commandName, config } = commandData
      const username = tags.username || 'unknown'
      const now = Date.now()
      
      // Check if command is active (defaults to true if not set)
      if (config?.active === false) {
        // Silently ignore - command is inactive
        return true // Command was blocked because it's inactive
      }
      
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
        const messageSuffix = messageLower !== trigger ? ` (${message})` : ''
        const logMessage = MESSAGE_COMMAND_USED.replace('{trigger}', trigger).replace('{username}', username).replace('{message}', messageSuffix)
        console.log(logMessage)
        
        // Emit to overlay console
        events.emit('command-log', {
          command: trigger,
          username: username,
          message: message
        })
        
        // Execute handler
        const result = handler(twitch, events, channel, tags, message)
        
        // Automatically emit socket event using command name (unless handler returns false)
        // This allows commands to opt-out by returning false if they want to handle emission manually
        if (result !== false) {
          events.emit(commandName)
        }
        
        return true // Command was handled
      } catch (err) {
        console.error(MESSAGE_ERROR_EXECUTING_COMMAND.replace('{trigger}', trigger).replace('{error}', err.message))
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

  // Default commands
  commandsWithAliases.push(...defaultCommands)

  // Directory-based commands
  for (const commandName of commandNames) {
    const trigger = `${CONFIG.prefix}${commandName}`
    // Skip if already registered as built-in (app/cmd-*.js)
    if (defaultCommands.some(dc => dc.trigger === trigger)) continue

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
        aliases: aliasTriggers,
        permission: config.permission
      })
    }
  }

  // Sort by trigger
  return commandsWithAliases.sort((a, b) => a.trigger.localeCompare(b.trigger))
}

