#!/usr/bin/env node
/**
 * Setup Botivo: get Twitch token via TwitchTokenGenerator.com, prompt for
 * TWITCH_USERNAME, TWITCH_CHANNEL, then update .env in place.
 *
 * Usage:
 *   node app/setup.js
 *   npm run setup
 */

import { exec } from 'child_process'
import { platform } from 'os'
import { createInterface } from 'readline'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// Messages
const MESSAGE_PROMPT_CHANNEL          = '▒ Setup       → What\'s the Twitch channel?'
const MESSAGE_PROMPT_USERNAME         = '▒ Setup       → And the Twitch account?'
const MESSAGE_INFO_AUTH_URL           = '▒ Setup       → Press Enter to continue. Or open the URL: '
const MESSAGE_INFO_WAITING            = '▒ Setup       → Waiting for authorization…'
const MESSAGE_SUCCESS_ENV_UPDATED     = '▒ Setup       ✓ .env updated successfully.\n'
const MESSAGE_ERROR_SESSION_NOT_FOUND = 'Session not found. Run the script again to create a new one.'
const MESSAGE_ERROR_SESSION_EXPIRED   = 'Session already used or expired. Run the script again to create a new one.'
const MESSAGE_ERROR_CREATE_FAILED     = 'Create failed: {status}'
const MESSAGE_ERROR_INVALID_SCOPES    = 'Invalid scopes (tried chat:read+chat:edit and chat_read+chat_edit). Check TwitchTokenGenerator.com for supported scope format.'
const MESSAGE_ERROR_UNKNOWN           = 'Unknown error'

const TTG_BASE = 'https://twitchtokengenerator.com/api'
const APP_TITLE = 'Botivo'
const POLL_INTERVAL_SEC = 4
const VAR_KEYS = ['TWITCH_USERNAME', 'TWITCH_TOKEN', 'TWITCH_CHANNEL', 'SERVER_PORT']

// Try chat:read+chat:edit first; TTG may use scope IDs like chat_read+chat_edit
const SCOPE_ALTERNATIVES = ['chat:read+chat:edit', 'chat_read+chat_edit']

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_PATH = join(__dirname, '..', '.env')
const ENV_EXAMPLE_PATH = join(__dirname, '..', '.env.example')

function base64Encode(str) {
  return Buffer.from(str, 'utf8').toString('base64')
}

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

function openBrowser(url) {
  const cmd = platform() === 'win32' ? 'start' : platform() === 'darwin' ? 'open' : 'xdg-open'
  exec(`${cmd} "${url}"`, () => {})
}

async function createSession() {
  const titleB64 = base64Encode(APP_TITLE)
  for (const scopes of SCOPE_ALTERNATIVES) {
    const url = `${TTG_BASE}/create/${titleB64}/${encodeURIComponent(scopes)}`
    const res = await fetch(url)
    const data = await res.json().catch(() => ({}))
    if (data.success && data.id && data.message) {
      return { id: data.id, authUrl: data.message }
    }
    if (data.error === 13 || (data.message && String(data.message).toLowerCase().includes('invalid scope'))) {
      continue
    }
    throw new Error(data.message || data.error_description || MESSAGE_ERROR_CREATE_FAILED.replace('{status}', res.status))
  }
  throw new Error(MESSAGE_ERROR_INVALID_SCOPES)
}

async function pollStatus(id) {
  const url = `${TTG_BASE}/status/${id}`
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (data.success && data.token) {
    return { success: true, token: data.token }
  }
  const err = data.error
  const msg = data.message || MESSAGE_ERROR_UNKNOWN
  if (err === 3) return { success: false, pending: true }
  if (err === 2) throw new Error(MESSAGE_ERROR_SESSION_NOT_FOUND)
  if (err === 4 || err === 6) throw new Error(MESSAGE_ERROR_SESSION_EXPIRED)
  throw new Error(msg)
}

function ask(rl, question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`${question} `, (answer) => {
      const trimmed = answer.trim()
      resolve(trimmed !== '' ? trimmed : (defaultValue ?? ''))
    })
  })
}

/** Remove # or @ prefix from channel name if present */
function cleanChannelName(channel) {
  if (!channel) return channel
  return channel.replace(/^[#@]/, '')
}

/** Parse .env-style content into a map of key -> value for known keys, and return raw lines. */
function parseEnvContent(content) {
  const current = {}
  const lines = content.split(/\r?\n/)
  for (const line of lines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|(\S+))/)
    if (m && VAR_KEYS.includes(m[1])) {
      current[m[1]] = m[2] !== undefined ? m[2].replace(/\\(.)/g, '$1') : m[3]
    }
  }
  return { current, lines }
}

/** Update env lines with new values; append any key that wasn't present. */
function updateEnvLines(lines, vars) {
  const seen = new Set()
  const updated = lines.map((line) => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|.*)/)
    if (m && VAR_KEYS.includes(m[1]) && vars[m[1]] !== undefined && vars[m[1]] !== '') {
      seen.add(m[1])
      return `${m[1]}="${String(vars[m[1]]).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    }
    return line
  })
  const appendOrder = ['TWITCH_USERNAME', 'TWITCH_TOKEN', 'TWITCH_CHANNEL', 'SERVER_PORT']
  for (const key of appendOrder) {
    if (seen.has(key) || vars[key] === undefined || vars[key] === '') continue
    updated.push(`${key}="${String(vars[key]).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
  }
  const out = updated.join('\n')
  return out.endsWith('\n') ? out : out + '\n'
}


async function runTokenFlow(rl) {
  const session = await createSession()
  const { id, authUrl } = session
  process.stdout.write(MESSAGE_INFO_AUTH_URL + authUrl)
  
  // Wait for user to press Enter
  await new Promise((resolve) => {
    rl.once('line', () => {
      // Move cursor up one line and clear it to remove the blank line
      process.stdout.write('\r\x1b[K')
      resolve()
    })
  })
  
  openBrowser(authUrl)
  console.log(MESSAGE_INFO_WAITING)

  for (;;) {
    const result = await pollStatus(id)
    if (result.success) {
      return result.token
    }
    if (result.pending) {
      await sleep(POLL_INTERVAL_SEC)
      continue
    }
  }
}

export async function runSetup() {
  // 1. Load existing .env
  const envContent = existsSync(ENV_PATH)
    ? readFileSync(ENV_PATH, 'utf8')
    : readFileSync(ENV_EXAMPLE_PATH, 'utf8')
  const { current, lines } = parseEnvContent(envContent)

  // 2. Prompt for channel and username FIRST
  const rl = createInterface({ 
    input: process.stdin, 
    output: process.stdout,
    terminal: false
  })
  const channelRaw = await ask(rl, MESSAGE_PROMPT_CHANNEL, current.TWITCH_CHANNEL)
  const channel = cleanChannelName(channelRaw)
  const username = await ask(rl, MESSAGE_PROMPT_USERNAME, current.TWITCH_USERNAME)

  // 3. Then do token flow (with browser prompt)
  let token
  try {
    token = await runTokenFlow(rl)
  } catch (err) {
    rl.close()
    console.error(err.message)
    process.exit(1)
  }

  // 4. Update .env with all values (PORT uses default 8080 if not set)
  const port = current.SERVER_PORT || '8080'
  const vars = {
    TWITCH_USERNAME: username,
    TWITCH_TOKEN: token,
    TWITCH_CHANNEL: channel,
    SERVER_PORT: port
  }

  const newContent = updateEnvLines(lines, vars)
  writeFileSync(ENV_PATH, newContent, 'utf8')
  rl.close()
  console.log(MESSAGE_SUCCESS_ENV_UPDATED)
}

// Run setup if this file is being executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSetup()
}
