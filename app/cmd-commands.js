import { CONFIG } from './config.js'
import { getCommandsList } from './commands.js'

export function handler(twitch, events, channel) {
  const commandsList = getCommandsList()
  const showAliases = CONFIG.defaultCommands?.commands?.showAliases === true

  // Filter out commands with permission: 'broadcaster'
  const filteredCommands = commandsList.filter(cmd => cmd.permission !== 'broadcaster')

  // Format each command with aliases: !music [!yt, !youtube]
  const formattedCommands = filteredCommands.map(cmd => {
    if (showAliases && cmd.aliases.length > 0) {
      return `${cmd.trigger} [${cmd.aliases.join(', ')}]`
    }
    return cmd.trigger
  })

  const commandsString = formattedCommands.map(s => s.trim()).filter(Boolean).join(', ')
  twitch.say(channel, `Available commands: ${commandsString}`)
}
