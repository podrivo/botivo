// Imports
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

// Set dotenv (suppress dotenv message)
const originalLog = console.log
console.log = (...args) => {
  // Suppress dotenv messages
  if (args[0] && typeof args[0] === 'string' && args[0].includes('[dotenv@')) {
    return
  }
  originalLog(...args)
}
config()
console.log = originalLog

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '.env')

// Validate environment
export function variablesValidate() {
  // Check if .env file exists
  if (!existsSync(envPath)) {
    console.error('× File .env was not found')
    process.exit(1)
  }

  // Validate environment variables
  const requiredVars = ['TWITCH_USERNAME', 'TWITCH_PASSWORD', 'TWITCH_CHANNEL', 'SERVER_PORT']
  const missingVars = requiredVars.filter(v => !process.env[v])

  if (missingVars.length > 0) {
    console.error(`× Missing required environment variables: ${missingVars.map(v => `${v}`).join(', ')}`)
    process.exit(1)
  }
}

// Get and validate port
export function variablesPort() {
  const port = parseInt(process.env.SERVER_PORT, 10)
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(`× SERVER_PORT must be a valid number between 1 and 65535. Got: ${process.env.SERVER_PORT}`)
    process.exit(1)
  }
  return port
}

