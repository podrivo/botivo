// Imports
import { variablesValidate, variablesPort } from './app/variables.js'
import { startServer } from './app/server.js'
import { startSocket } from './app/socket.js'
import { startClient } from './app/client.js'
import { loadCommands } from './app/commands.js'

// Initialize application
(async () => {

  console.log(`
@@@@@@@@@@    @@@@@@@%@@@@@    #@@@@%@@@@@@@@@%@@@@@@@  
@@        @@@*       @    *@@@@@    @    @    @       @@ 
@@         @         @         @@@@@@    @    @         @
@@    @   .@    @    @    @@@@@@    @    @    @    @    @
@@       @@@    @    @    @    @    @    @    @    @    @
@@    @    @    @    @    @    @    @    @    @    @    @
@@    @    @    @    @    @    @    @    @    @.   @    @
@@        .@         @@        @    @         @@        @
@@       @@@       @@@@@.      @    @       @@@@@#      @
@@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@
@@@@@@@@@  @@@@@@@@     @@@@@@@@@@@@@@@@@@@@    @@@@@@@@@
`);

  console.log(`█ BOTIVO is starting...`)

  // Validate environment variables
  variablesValidate()
  const port = variablesPort()

  // Start overlay server (Express.js)
  const overlay = await startServer(port)

  // Start communication channel (Socket.IO)
  const communication = await startSocket(overlay)

  // Start Twitch client (tmi.js)
  await startClient(communication)

  // Load all commands
  await loadCommands()

  console.log(`█ BOTIVO is ready!`)
})()

