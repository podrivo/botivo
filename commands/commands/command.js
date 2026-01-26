import { getCommandsList } from '../../app/commands.js'

export default function(client, io, channel, tags, message) {
  const commandsList = getCommandsList()
  
  // Format each command with aliases: !music [!yt, !youtube]
  const formattedCommands = commandsList.map(cmd => {
    if (cmd.aliases.length > 0) {
      return `${cmd.trigger} [${cmd.aliases.join(', ')}]`
    }
    return cmd.trigger
  })
  
  const commandsString = formattedCommands.join(', ')
  const commandsMessage = `Available commands: ${commandsString}`
  
  client.say(channel, commandsMessage)
}
