// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY_PLAYLIST = 'playlist'
const YOUTUBE_API_URL = 'https://www.youtube.com/iframe_api'
const DEFAULT_VIDEO_ID = 'su2ZN0qCM6Y'

// Player configuration
const PLAYER_CONFIG = {
  playerVars: {
    autoplay: 0,
    cc_load_policy: 0,
    controls: 0,
    disablekb: 1,
    enablejsapi: 1,
    fs: 0,
    iv_load_policy: 3,
    rel: 0
  }
}

// DOM selectors
const SELECTORS = {
  MUSIC: '.music-wrapper',
  PLAYER: '#player'
}

// ============================================================================
// Playlist Management
// ============================================================================

/**
 * Gets the current playlist from localStorage
 * @returns {string[]} - Array of video IDs
 */
function getPlaylist() {
  const stored = localStorage.getItem(STORAGE_KEY_PLAYLIST)
  return stored ? JSON.parse(stored) : []
}

/**
 * Saves the playlist to localStorage
 * @param {string[]} playlist - Array of video IDs
 */
function savePlaylist(playlist) {
  localStorage.setItem(STORAGE_KEY_PLAYLIST, JSON.stringify(playlist))
}

/**
 * Initializes playlist in localStorage if it doesn't exist
 */
function initializePlaylist() {
  if (!localStorage.getItem(STORAGE_KEY_PLAYLIST)) {
    savePlaylist([])
  }
}

// ============================================================================
// YouTube Player Management
// ============================================================================

let youtubePlayer = null
let isPlayerInitialized = false

/**
 * Loads the YouTube IFrame API script
 */
function loadYouTubeAPI() {
  // Check if API is already loaded
  if (window.YT && window.YT.Player) {
    initializePlayer()
    return
  }
  
  // Check if script is already being loaded
  if (document.querySelector(`script[src="${YOUTUBE_API_URL}"]`)) {
    return
  }
  
  const script = document.createElement('script')
  script.src = YOUTUBE_API_URL
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript.parentNode.insertBefore(script, firstScript)
}

/**
 * Initializes the YouTube player
 * Must be called after YouTube API is loaded
 */
function initializePlayer() {
  if (isPlayerInitialized) return
  
  const playerElement = document.querySelector(SELECTORS.PLAYER)
  if (!playerElement) {
    console.warn('Music player: Player element not found')
    return
  }
  
  youtubePlayer = new YT.Player(SELECTORS.PLAYER.slice(1), {
    ...PLAYER_CONFIG,
    videoId: DEFAULT_VIDEO_ID,
    events: {
      onReady: null,
      onStateChange: onPlayerStateChange
    }
  })
  
  // Make player globally accessible for debugging
  window.player = youtubePlayer
  isPlayerInitialized = true
}

/**
 * YouTube API callback (must be global)
 * Called automatically when YouTube API loads
 */
window.onYouTubeIframeAPIReady = function() {
  initializePlayer()
}

/**
 * Handles player state changes
 */
function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.PLAYING:
      // Video started playing
      break
      
    case YT.PlayerState.ENDED:
      // Video ended - play next in queue
      playNextVideo()
      break
      
    case YT.PlayerState.BUFFERING:
      // Try to resume if buffering
      if (youtubePlayer) {
        youtubePlayer.playVideo()
      }
      break
  }
}

// ============================================================================
// Playlist Playback
// ============================================================================

/**
 * Plays the next video in the queue
 */
function playNextVideo() {
  const playlist = getPlaylist()
  
  if (playlist.length === 0 || !youtubePlayer) {
    return
  }
  
  const nextVideoId = playlist.shift()
  savePlaylist(playlist)
  
  youtubePlayer.loadVideoById(nextVideoId)
  youtubePlayer.playVideo()
}

// Make playNextVideo globally accessible (used by command handler)
window.nextVideo = playNextVideo

// ============================================================================
// UI Effects
// ============================================================================

/**
 * Gets the music element from DOM
 * @returns {HTMLElement|null}
 */
function getMusicElement() {
  return document.querySelector(SELECTORS.MUSIC)
}


// ============================================================================
// Command Handlers
// ============================================================================

/**
 * Handles play command
 */
function handlePlayCommand() {
  if (youtubePlayer) {
    youtubePlayer.playVideo()
  }
}

/**
 * Handles pause command
 */
function handlePauseCommand() {
  if (youtubePlayer) {
    youtubePlayer.pauseVideo()
  }
}

/**
 * Handles next command
 */
function handleNextCommand() {
  playNextVideo()
}

/**
 * Handles zoom command
 */
function handleZoomCommand() {
  const musicEl = getMusicElement()
  if (!musicEl) return
  
  musicEl.classList.toggle('zoom')
}

/**
 * Handles volume command
 * @param {number} volume - Volume level (0-100)
 */
function handleVolumeCommand(volume) {
  if (!isNaN(volume) && volume >= 0 && volume <= 100 && youtubePlayer) {
    youtubePlayer.setVolume(volume)
  }
}

/**
 * Handles queue command - sends current queue size back to server
 */
function handleQueueCommand(events) {
  const playlist = getPlaylist()
  events.emit('queue', playlist)
}

/**
 * Handles adding a video to the queue
 * @param {string} videoId - YouTube video ID
 */
function handleQueueAddCommand(videoId) {
  if (!videoId) return
  
  const playlist = getPlaylist()
  playlist.push(videoId)
  savePlaylist(playlist)
}

// ============================================================================
// Socket Event Handler
// ============================================================================

/**
 * Main socket event handler for music commands
 * @param {string} command - Command name (play, pause, next, zoom, vol, queue, or null for queue add)
 * @param {string|number} extra - Additional parameter (video ID for queue add, volume for vol)
 */
function handleMusicCommand(events, command, extra) {
  const musicEl = getMusicElement()
  if (!musicEl) return
  
  // Route to appropriate handler
  switch (command) {
    case 'play':
      handlePlayCommand()
      break
      
    case 'pause':
      handlePauseCommand()
      break
      
    case 'next':
      handleNextCommand()
      break
      
    case 'zoom':
      handleZoomCommand()
      break
      
    case 'vol':
      handleVolumeCommand(extra)
      break
      
    case 'queue':
      handleQueueCommand(events)
      break
      
    // Default: treat as queue add (command is null, extra is video ID)
    default:
      if (extra) {
        handleQueueAddCommand(extra)
      }
      break
  }
}

// ============================================================================
// Initialization
// ============================================================================

export function init(events) {
  // Initialize playlist storage
  initializePlaylist()

  // Load YouTube API
  loadYouTubeAPI()

  // Set up socket listener for music subcommands
  events.on('music', (command, extra) => {
    handleMusicCommand(events, command, extra)
  })
}

// Default handler is kept for consistency with the rest of the commands,
// but all per-command logic is driven by the 'music' event listener above.
export default function(events) {
  // No-op: music overlay reacts via the 'music' socket event and
  // handleMusicCommand, not via direct command invocations.
}
