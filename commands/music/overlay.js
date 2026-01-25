/**
 * Music Command Overlay Handler
 * 
 * Manages YouTube player and playlist functionality in the overlay.
 * Handles socket events from the command handler to control playback.
 */

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY_PLAYLIST = 'playlist'
const YOUTUBE_API_URL = 'https://www.youtube.com/iframe_api'
const DEFAULT_VIDEO_ID = 'su2ZN0qCM6Y' // Placeholder video

// Player configuration
const PLAYER_CONFIG = {
  height: '537',
  width: '954',
  playerVars: {
    autoplay: 0,
    cc_load_policy: 0,
    controls: 0,
    disablekb: 1,
    enablejsapi: 1,
    fs: 0,
    iv_load_policy: 3,
    origin: location.href,
    rel: 0
  }
}

// Animation timings (in milliseconds)
const ANIMATION_TIMINGS = {
  MUSIC_ELEMENT_HIDE: 250,
  TRANSITION_HIDE: 1000
}

// DOM selectors
const SELECTORS = {
  MUSIC: '.music',
  PLAYER: '#player',
  TRANSITION: '.transition',
  ROOM: '.room',
  ROOM_FURNITURE: '.room-furniture'
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
      onReady: onPlayerReady,
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
 * Called when the player is ready
 */
function onPlayerReady(event) {
  event.target.playVideo()
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
// Audio Effects
// ============================================================================

/**
 * Plays an audio file with error handling
 * Gracefully handles missing files or autoplay restrictions
 * @param {string} audioPath - Path to audio file
 */
function playAudioEffect(audioPath) {
  try {
    const audio = new Audio(audioPath)
    
    // Handle loading errors silently (file may not exist)
    audio.addEventListener('error', () => {
      // Silently ignore - file may not exist
    }, { once: true })
    
    // Attempt to play, catch any errors
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Silently ignore - autoplay may be blocked or file missing
      })
    }
  } catch (error) {
    // Silently ignore any audio creation errors
  }
}

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

/**
 * Gets the transition element from DOM
 * @returns {HTMLElement|null}
 */
function getTransitionElement() {
  return document.querySelector(SELECTORS.TRANSITION)
}

/**
 * Removes the 'on' class from room elements (used when zooming)
 */
function hideRoomElements() {
  const roomElement = document.querySelector(SELECTORS.ROOM)
  if (roomElement?.classList.contains('on')) {
    roomElement.classList.remove('on')
  }
  
  const roomFurnitureElement = document.querySelector(SELECTORS.ROOM_FURNITURE)
  if (roomFurnitureElement?.classList.contains('on')) {
    roomFurnitureElement.classList.remove('on')
  }
}

/**
 * Hides the music element after animation
 */
function hideMusicElement() {
  const musicEl = getMusicElement()
  if (musicEl) {
    musicEl.classList.remove('on')
  }
}

/**
 * Hides the transition element after animation
 */
function hideTransitionElement() {
  const transitionEl = getTransitionElement()
  if (transitionEl) {
    transitionEl.classList.remove('on')
  }
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
  hideRoomElements()
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
function handleQueueCommand(socket) {
  const playlist = getPlaylist()
  socket.emit('queue', playlist)
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
  
  // Show transition effect
  const transitionEl = getTransitionElement()
  if (transitionEl) {
    transitionEl.classList.add('on')
  }
}

// ============================================================================
// Socket Event Handler
// ============================================================================

/**
 * Main socket event handler for music commands
 * @param {string} command - Command name (play, pause, next, zoom, vol, queue, or null for queue add)
 * @param {string|number} extra - Additional parameter (video ID for queue add, volume for vol)
 */
function handleMusicCommand(socket, command, extra) {
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
      handleQueueCommand(socket)
      break
      
    // Default: treat as queue add (command is null, extra is video ID)
    default:
      if (extra) {
        handleQueueAddCommand(extra)
      }
      break
  }
  
  // Hide music element after animation
  setTimeout(() => {
    hideMusicElement()
  }, ANIMATION_TIMINGS.MUSIC_ELEMENT_HIDE)
  
  // Hide transition element after animation
  setTimeout(() => {
    hideTransitionElement()
  }, ANIMATION_TIMINGS.TRANSITION_HIDE)
}

// ============================================================================
// Initialization
// ============================================================================

export default function(socket) {
  // Initialize playlist storage
  initializePlaylist()
  
  // Load YouTube API
  loadYouTubeAPI()
  
  // Set up socket listener
  socket.on('music', (command, extra) => {
    handleMusicCommand(socket, command, extra)
  })
}
