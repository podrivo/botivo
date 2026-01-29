// Botivo configuration
export const CONFIG = {
  prefix: '!',                 // Command prefix ("!" for !train, !example)
  twitchReconnect: true,       // Automatically reconnect to Twitch on disconnect
  folderCommands: 'commands',  // Directory name where commands are stored
  folderOverlay: 'overlay',    // Directory name where overlay files are stored
  cooldownGlobal: 5000,        // Global cooldown if a command doesn't specify its own

  // Built-in (default) commands live in app/commands.js
  // These configs follow the same shape as ../commands/<name>/config.js
  defaultCommands: {
    commands: {
      active: true,
      cooldown: 0,
      alias: ['command']
    },
    kill: {
      active: true,
      cooldown: 0,
      permission: 'broadcaster',
      alias: ['stop', 'killall', 'kill-all']
    }
  }
}