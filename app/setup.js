#!/usr/bin/env node
/**
 * Setup Botivo: get Twitch token via TwitchTokenGenerator.com, prompt for
 * TWITCH_USERNAME, TWITCH_CHANNEL, SERVER_PORT, then update .env in place.
 *
 * Usage:
 *   node app/setup.js
 *   npm run setup
 *
 * Refresh token only (then prompt for other vars and update .env):
 *   node app/setup.js --refresh
 *   TWITCH_REFRESH_TOKEN=xxx node app/setup.js --refresh
 */

import { exec } from 'child_process'
import { platform } from 'os'
import { createInterface } from 'readline'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const TTG_BASE = 'https://twitchtokengenerator.com/api'
const APP_TITLE = 'Botivo'
const POLL_INTERVAL_SEC = 4
const VAR_KEYS = ['TWITCH_USERNAME', 'TWITCH_TOKEN', 'TWITCH_REFRESH_TOKEN', 'TWITCH_CHANNEL', 'SERVER_PORT']

// Try chat:read+chat:edit first; TTG may use scope IDs like chat_read+chat_edit
const SCOPE_ALTERNATIVES = ['chat:read+chat:edit', 'chat_read+chat_edit']

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_PATH = join(__dirname, '..', '.env')
const ENV_EXAMPLE_PATH = join(__dirname, '..', '.env.example')

function base64Encode(str) {
  return Buffer.from(str, 'utf8').toString('base64')
}

function getRefreshToken() {
  const env = process.env.TWITCH_REFRESH_TOKEN?.trim()
  if (env) return env
  const args = process.argv.slice(2)
  const i = args.indexOf('--refresh')
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('-')) return args[i + 1].trim()
  return null
}

function hasRefreshFlag() {
  return process.argv.includes('--refresh')
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
    throw new Error(data.message || data.error_description || `Create failed: ${res.status}`)
  }
  throw new Error('Invalid scopes (tried chat:read+chat:edit and chat_read+chat_edit). Check TwitchTokenGenerator.com for supported scope format.')
}

async function pollStatus(id) {
  const url = `${TTG_BASE}/status/${id}`
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (data.success && data.token) {
    return { success: true, token: data.token, refresh: data.refresh || null }
  }
  const err = data.error
  const msg = data.message || 'Unknown error'
  if (err === 3) return { success: false, pending: true }
  if (err === 2) throw new Error('Session not found. Run the script again to create a new one.')
  if (err === 4 || err === 6) throw new Error('Session already used or expired. Run the script again to create a new one.')
  throw new Error(msg)
}

async function refreshTokenViaTTG(refreshToken) {
  const url = `${TTG_BASE}/refresh/${encodeURIComponent(refreshToken)}`
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (!data.token) {
    const msg = data.message || data.error_description || `Refresh failed: ${res.status}`
    throw new Error(msg + '. Run the script without --refresh to authorize again in the browser.')
  }
  return { token: data.token, refresh: data.refresh || refreshToken }
}

function ask(rl, question, defaultValue) {
  const prompt = defaultValue != null && defaultValue !== '' ? `${question} (default: ${defaultValue}): ` : `${question}: `
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      const trimmed = answer.trim()
      resolve(trimmed !== '' ? trimmed : (defaultValue ?? ''))
    })
  })
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
  const appendOrder = ['TWITCH_USERNAME', 'TWITCH_TOKEN', 'TWITCH_REFRESH_TOKEN', 'TWITCH_CHANNEL', 'SERVER_PORT']
  for (const key of appendOrder) {
    if (seen.has(key) || vars[key] === undefined || vars[key] === '') continue
    updated.push(`${key}="${String(vars[key]).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
  }
  const out = updated.join('\n')
  return out.endsWith('\n') ? out : out + '\n'
}

async function promptForVars(rl, current, token, refreshToken) {
  const username = await ask(rl, 'Twitch username (bot account)', current.TWITCH_USERNAME)
  const channel = await ask(rl, 'Twitch channel (no #)', current.TWITCH_CHANNEL)
  const portRaw = await ask(rl, 'Overlay server port', current.SERVER_PORT || '8080')
  const port = portRaw.trim() !== '' ? portRaw : '8080'
  return {
    TWITCH_USERNAME: username,
    TWITCH_TOKEN: token,
    TWITCH_REFRESH_TOKEN: refreshToken || '',
    TWITCH_CHANNEL: channel,
    SERVER_PORT: port
  }
}

async function runTokenFlow() {
  if (hasRefreshFlag()) {
    const refresh = getRefreshToken()
    if (!refresh) {
      console.error('Usage: node app/setup.js --refresh [refresh_token]')
      console.error('   or: TWITCH_REFRESH_TOKEN=xxx node app/setup.js --refresh')
      process.exit(1)
    }
    const { token, refresh: newRefresh } = await refreshTokenViaTTG(refresh)
    return { token, refreshToken: newRefresh }
  }

  const session = await createSession()
  const { id, authUrl } = session
  console.log('\nOpen this URL in your browser and authorize with your Twitch account:')
  console.log(authUrl)
  console.log('\nWaiting for authorization…\n')
  openBrowser(authUrl)

  for (;;) {
    const result = await pollStatus(id)
    if (result.success) {
      return { token: result.token, refreshToken: result.refresh }
    }
    if (result.pending) {
      await sleep(POLL_INTERVAL_SEC)
      continue
    }
  }
}

async function main() {
  let token
  let refreshToken = null
  try {
    const result = await runTokenFlow()
    token = result.token
    refreshToken = result.refreshToken || null
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }

  const envContent = existsSync(ENV_PATH)
    ? readFileSync(ENV_PATH, 'utf8')
    : readFileSync(ENV_EXAMPLE_PATH, 'utf8')
  const { current, lines } = parseEnvContent(envContent)

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const vars = await promptForVars(rl, current, token, refreshToken)
  rl.close()

  const newContent = updateEnvLines(lines, vars)
  writeFileSync(ENV_PATH, newContent, 'utf8')
  console.log('\n.env updated successfully.')
}

main()
