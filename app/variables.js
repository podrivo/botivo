// Imports
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

// Messages
const MESSAGE_INFO_SETUP_REQUIRED  = '▒ Variables   × ERROR: .env file not found. Starting setup...\n'
const MESSAGE_ERROR_MISSING_VARS   = '▒ Variables   × ERROR: Missing following environment variables {vars}'
const MESSAGE_ERROR_INVALID_PORT   = '▒ Variables   × ERROR: SERVER_PORT must be a valid number between 1 and 65535. Got: {port}'
const MESSAGE_SUCCESS_ENV_FOUND    = '▒ Variables   ✓ Found .env and environment variables'

// Set dotenv (suppress dotenv message)
function configWithSuppressedLogs(options) {
  const originalLog = console.log
  console.log = (...args) => {
    const message = args[0]?.toString() || ''
    if (!message.includes('[dotenv@') && !message.includes('injecting env')) {
      originalLog(...args)
    }
  }
  const result = config(options)
  console.log = originalLog
  return result
}
configWithSuppressedLogs()

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '.env')

// Validate environment
export async function variablesValidate() {
  // Check if .env file exists
  if (!existsSync(envPath)) {
    console.log(MESSAGE_INFO_SETUP_REQUIRED)
    const { runSetup } = await import('./setup.js')
    await runSetup()
    // Reload dotenv after setup
    configWithSuppressedLogs({ override: true })
  }

  // Validate environment variables
  const requiredVars = ['TWITCH_USERNAME', 'TWITCH_TOKEN', 'TWITCH_CHANNEL', 'SERVER_PORT']
  const missingVars = requiredVars.filter(v => !process.env[v])

  if (missingVars.length > 0) {
    console.error(MESSAGE_ERROR_MISSING_VARS.replace('{vars}', missingVars.map(v => `${v}`).join(', ')))
    process.exit(1)
  }
}

// Get and validate port
export function variablesPort() {
  const port = parseInt(process.env.SERVER_PORT, 10)
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(MESSAGE_ERROR_INVALID_PORT.replace('{port}', process.env.SERVER_PORT))
    process.exit(1)
  }

  console.error(MESSAGE_SUCCESS_ENV_FOUND)
  return port
}

