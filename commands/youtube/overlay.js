
// Constants
const STORAGE_PLAYLIST = 'playlist'
const YOUTUBE_API_URL = 'https://www.youtube.com/iframe_api'
const ELEMENT_MUSIC = '.youtube-wrapper'
const ELEMENT_PLAYER = '#player'

// ============================================================================
// Playlist Management
// ============================================================================

// Gets the current playlist from localStorage
function getPlaylist() {
  const stored = localStorage.getItem(STORAGE_PLAYLIST)

  // Return Array of video IDs
  return stored ? JSON.parse(stored) : []
}

// Saves the playlist to localStorage
function savePlaylist(playlist) {
  localStorage.setItem(STORAGE_PLAYLIST, JSON.stringify(playlist))
}

// ============================================================================
// YouTube Player Management
// ============================================================================

let youtubePlayer = null
let isPlayerInitialized = false

// Initializes the YouTube player with the first video ID
// Must be called after YouTube API is loaded; only called when we have a video (e.g. first !youtube link)
function initializePlayer(videoId) {
  if (isPlayerInitialized || !videoId) return
  
  youtubePlayer = new YT.Player(ELEMENT_PLAYER.slice(1), {
    playerVars: {
      autoplay: 0,
      cc_load_policy: 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      iv_load_policy: 3,
      rel: 0
    },
    videoId,
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
 * Called when YouTube API loads; initializes player with first video in playlist if any
 */
function onYouTubeIframeAPIReady() {
  const playlist = getPlaylist()
  if (playlist.length > 0 && !isPlayerInitialized) {
    const videoId = playlist.shift()
    savePlaylist(playlist)
    initializePlayer(videoId)
  }
}

// Handles player state changes
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

// Plays the next video in the queue
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
// Command Handlers
// ============================================================================

// Handles play command
function handlePlayCommand() {
  if (youtubePlayer) {
    youtubePlayer.playVideo()
  }
}

// Handles pause command
function handlePauseCommand() {
  if (youtubePlayer) {
    youtubePlayer.pauseVideo()
  }
}

// Handles next command
function handleNextCommand() {
  playNextVideo()
}

// Handles zoom command
function handleZoomCommand(musicEl) {
  musicEl.classList.toggle('zoom')
}

// Handles volume command
function handleVolumeCommand(volume) {
  if (!isNaN(volume) && volume >= 0 && volume <= 100 && youtubePlayer) {
    youtubePlayer.setVolume(volume)
  }
}

// Handles queue command - sends current queue size back to server
function handleQueueCommand(events) {
  const playlist = getPlaylist()
  events.emit('queue', playlist)
}

// Handles adding a video to the queue
function handleQueueAddCommand(videoId) {
  if (!videoId) return
  
  const playlist = getPlaylist()
  playlist.push(videoId)
  savePlaylist(playlist)
}


export default function (events, command, extra) {

  // Get DOM element
  const musicEl = document.querySelector(ELEMENT_MUSIC)

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
      handleZoomCommand(musicEl)
      break

    case 'vol':
      handleVolumeCommand(extra)
      break

    case 'queue':
      handleQueueCommand(events)
      break

    // Default: treat as queue add (command is null, extra is video ID) — first link is the first videoId
    default:
      if (extra) {
        handleQueueAddCommand(extra)
        // If API already loaded and player not initialized, start with this video
        if (window.YT && window.YT.Player && !isPlayerInitialized) {
          const playlist = getPlaylist()
          if (playlist.length > 0) {
            const videoId = playlist.shift()
            savePlaylist(playlist)
            initializePlayer(videoId)
          }
        }
      }
      break
  }

  // Initializes playlist in localStorage if it doesn't exist
  if (!localStorage.getItem(STORAGE_PLAYLIST)) {
    savePlaylist([])
  }

  // Register global callback for when YouTube API loads (so first video starts after script loads)
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady

  // Check if script is already being loaded
  if (document.querySelector(`script[src="${YOUTUBE_API_URL}"]`)) {
    return
  }

  // Load YouTube API script
  const script = document.createElement('script')
  script.src = YOUTUBE_API_URL
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript.parentNode.insertBefore(script, firstScript)
}
