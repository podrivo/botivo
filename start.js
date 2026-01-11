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
  const events = await startEvents(overlay, port)

  // Start Twitch client (tmi.js)
  await startTwitch(events)

  // Load all commands
  await startCommands()

  // Random startup messages
  const startupMessages = [
    `█ BOTIVO is up and running!`,
    `█ BOTIVO is ready to go!`,
    `█ BOTIVO has been activated!`,
    `█ BOTIVO is live and operational!`,
    `█ BOTIVO is online and ready!`,
    `█ BOTIVO has successfully started!`,
    `█ BOTIVO is running smoothly!`,
    `█ BOTIVO is active and waiting!`,
    `█ BOTIVO has booted up successfully!`,
    `█ BOTIVO is ready for action!`,
    `█ BOTIVO is fully operational!`,
    `█ BOTIVO is now live!`,
    `█ BOTIVO has launched successfully!`,
    `█ BOTIVO is ready to serve!`,
    `█ BOTIVO is powered up and ready!`,
    `█ BOTIVO is initialized and active!`,
    `█ BOTIVO is fired up and ready!`,
    `█ BOTIVO has come online!`,
    `█ BOTIVO is all systems go!`,
    `█ BOTIVO is ready to rock!`
  ]
  const randomMessage = startupMessages[Math.floor(Math.random() * startupMessages.length)]
  console.log(`\n${randomMessage}\n`)
})()

