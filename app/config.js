// Botivo configuration

// Check for --debug flag in process.argv or DEBUG env var
const isDebug = process.argv.includes('--debug') || process.env.DEBUG === 'true'

export const CONFIG = {
  debug: isDebug,              // Enable debug logging (tmi.js, command usage, and overlay logging)
  prefix: '!',                 // Command prefix (e.g., "!" for !train, !example)
  twitchReconnect: false,      // Automatically reconnect on disconnect
  folderCommands: 'commands',  // Directory name where commands are stored (relative to project root)
  folderOverlay: 'overlay',    // Directory name where overlay files are stored (relative to project root)
  cooldownGlobal: 5000         // Global cooldown (ms) used when a command doesn't specify its own cooldown
}


