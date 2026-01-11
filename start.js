// Imports
import { variablesValidate, variablesPort } from './app/variables.js'
import { startOverlay } from './app/overlay.js'
import { startEvents } from './app/events.js'
import { startTwitch } from './app/twitch.js'
import { startCommands } from './app/commands.js'

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

  console.log(`█ BOTIVO starting...\n`)

  // Validate environment variables
  variablesValidate()
  const port = variablesPort()

  // Start overlay server (Express.js)
  const overlay = await startOverlay(port)

  // Start communication channel (Socket.IO)
  const events = await startEvents(overlay)

  // Start Twitch client (tmi.js)
  await startTwitch(events)

  // Load all commands
  await startCommands()

  console.log(`\n█ BOTIVO is up and running!`)
})()

