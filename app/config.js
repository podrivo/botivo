// Botivo configuration
export const CONFIG = {

  prefix: '!',                 // Command prefix ("!" for !train, !example)
  twitchReconnect: true,       // Automatically reconnect to Twitch on disconnect
  folderCommands: 'commands',  // Directory name where commands are stored
  folderOverlay: 'overlay',    // Directory name where overlay files are stored
  cooldownGlobal: 5000,        // Global cooldown if a command doesn't specify its own

  defaultCommands: {

    // !commands
    commands: {
      enabled: true,
      cooldown: 0,
      alias: ['command'],
      showAliases: false       // Show aliases: "!example [!demo]" vs "!example"
    },

    // !kill
    kill: {
      enabled: true,
      cooldown: 0,
      permission: 'broadcaster',
      alias: ['stop', 'killall']
    }
  }
}