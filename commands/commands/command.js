import { getCommandsList } from '../../app/commands.js'
import { CONFIG } from '../../app/config.js'

// Helper function to load command config
async function loadCommandConfig(commandName) {
  try {
    const configModule = await import(`../${commandName}/config.js`)
    return configModule.config || {}
  } catch {
    // config.js doesn't exist, use default config (no permission restriction)
    return {}
  }
}

export default async function(client, io, channel, tags, message) {
  const commandsList = getCommandsList()
  
  // Filter out commands with permission: 'broadcaster'
  const filteredCommands = []
  for (const cmd of commandsList) {
    // Extract command name from trigger (e.g., "!train" -> "train")
    const commandName = cmd.trigger.replace(CONFIG.prefix, '')
    const config = await loadCommandConfig(commandName)
    
    // Skip commands with broadcaster permission
    if (config.permission !== 'broadcaster') {
      filteredCommands.push(cmd)
    }
  }
  
  // Format each command with aliases: !music [!yt, !youtube]
  const formattedCommands = filteredCommands.map(cmd => {
    if (cmd.aliases.length > 0) {
      return `${cmd.trigger} [${cmd.aliases.join(', ')}]`
    }
    return cmd.trigger
  })
  
  const commandsString = formattedCommands.join(', ')
  const commandsMessage = `Available commands: ${commandsString}`
  
  client.say(channel, commandsMessage)
}
