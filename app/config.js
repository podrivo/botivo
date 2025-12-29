// Botivo configuration
export const CONFIG = {
  debug: true,                 // Enable debug logging (tmi.js, command usage, and overlay logging)
  prefix: '!',                 // Command prefix (e.g., "!" for !train, !example)
  cooldownUser: 5000,          // Per-user cooldown: how long a user must wait between using any command
  cooldownGlobal: 2000,        // Global cooldown: minimum time between any command executions (all users)
  cooldownCommand: 10000,      // Per-command per-user cooldown: how long a user must wait to use the same command again
  twitchReconnect: true,       // Automatically reconnect on disconnect
  folderCommands: 'commands',  // Directory name where commands are stored (relative to project root)
  folderOverlay: 'overlay'     // Directory name where overlay files are stored (relative to project root)
}


