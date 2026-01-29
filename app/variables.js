// Imports
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

// Messages
const MESSAGE_ERROR_ENV_NOT_FOUND = '▒ Variables   × ERROR: File .env was not found'
const MESSAGE_ERROR_MISSING_VARS  = '▒ Variables   × ERROR: Missing following environment variables {vars}'
const MESSAGE_ERROR_INVALID_PORT  = '▒ Variables   × ERROR: SERVER_PORT must be a valid number between 1 and 65535. Got: {port}'
const MESSAGE_SUCCESS_ENV_FOUND   = '▒ Variables   ✓ Found .env and environment variables'

// Set dotenv (suppress dotenv message)
function suppressDotenvLogs() {
  const originalLog = console.log
  console.log = (...args) => {
    if (!args[0]?.includes?.('[dotenv@')) originalLog(...args)
  }
  config()
  console.log = originalLog
}
suppressDotenvLogs()

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '.env')

// Validate environment
export function variablesValidate() {
  // Check if .env file exists
  if (!existsSync(envPath)) {
    console.error(MESSAGE_ERROR_ENV_NOT_FOUND)
    process.exit(1)
  }

  // Validate environment variables
  const requiredVars = ['TWITCH_USERNAME', 'TWITCH_PASSWORD', 'TWITCH_CHANNEL', 'SERVER_PORT']
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

