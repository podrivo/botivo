export default function (socket) {
  // Initialize playlist in localStorage if it doesn't exist
  if (!localStorage.getItem('ccsPlaylist')) {
    localStorage.setItem('ccsPlaylist', JSON.stringify([]))
  }

  // Load YouTube IFrame API
  var tag = document.createElement('script')
  tag.src = "https://www.youtube.com/iframe_api"

  var firstScriptTag = document.getElementsByTagName('script')[0]
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

  var player
  var done = false

  // YouTube API callback (must be global)
  window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('player', {
      height: '537',
      width: '954',
      videoId: 'IEU0u42aj7M',
      playerVars: {
        'autoplay': 0,
        'cc_load_policy': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'iv_load_policy': 3,
        'origin': location.href,
        'rel': 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    })
    
    // Make player globally accessible
    window.player = player
  }

  function onPlayerReady(event) {
    event.target.playVideo()
  }

  function onPlayerStateChange(event) {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        if (!done) {
          done = true
        }
        break
      case YT.PlayerState.ENDED:
        nextVideo()
        break
      case YT.PlayerState.BUFFERING:
        player.playVideo()
        break
    }
  }

  function nextVideo() {
    const ccsPlaylist = JSON.parse(localStorage.getItem('ccsPlaylist') || '[]')

    if (ccsPlaylist.length > 0 && window.player) {
      const nextVideoId = ccsPlaylist.shift()
      localStorage.setItem('ccsPlaylist', JSON.stringify(ccsPlaylist))
      window.player.loadVideoById(nextVideoId)
      window.player.playVideo()
    }
  }

  // Make nextVideo globally accessible
  window.nextVideo = nextVideo

  // Helper function for border command effect
  function borderCommand() {
    const borderEl = document.querySelector('.border')
    if (borderEl) {
      borderEl.classList.add('on')
      setTimeout(() => {
        borderEl.classList.remove('on')
      }, 250)
    }
  }

  // Helper function to play audio (gracefully handles missing files)
  function playAudio(path) {
    try {
      const audio = new Audio(path)
      
      // Handle all possible errors silently
      audio.addEventListener('error', (e) => {
        // Silently ignore audio loading errors (file may not exist)
        return false
      }, { once: true })
      
      audio.addEventListener('loadstart', () => {
        // If loading fails, catch it here too
        audio.addEventListener('error', () => {}, { once: true })
      }, { once: true })
      
      // Attempt to play, but catch any errors
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silently ignore play errors (file may not exist or autoplay blocked)
        })
      }
    } catch (e) {
      // Silently ignore any audio creation errors
    }
  }

  // Get music element
  const musicEl = document.querySelector('.music')

  // Listen for music command events
  socket.on('music', (musicCommand, extra) => {
    if (!musicEl) return

    const ccsPlaylist = JSON.parse(localStorage.getItem('ccsPlaylist') || '[]')

    switch (musicCommand) {
      // !music play
      case 'play':
        borderCommand()
        playAudio('/audio/border.wav')
        if (window.player) {
          window.player.playVideo()
        }
        break

      // !music pause
      case 'pause':
        borderCommand()
        playAudio('/audio/border.wav')
        if (window.player) {
          window.player.pauseVideo()
        }
        break

      // !music next
      case 'next':
        borderCommand()
        playAudio('/audio/border.wav')
        if (window.nextVideo) {
          window.nextVideo()
        }
        break

      // !music zoom
      case 'zoom':
        musicEl.classList.toggle('zoom')
        borderCommand()
        playAudio('/audio/border.wav')

        const roomElementZoom = document.querySelector('.room')
        if (roomElementZoom && roomElementZoom.classList.contains('on')) {
          roomElementZoom.classList.remove('on')
        }

        const roomElementFurnitureZoom = document.querySelector('.room-furniture')
        if (roomElementFurnitureZoom && roomElementFurnitureZoom.classList.contains('on')) {
          roomElementFurnitureZoom.classList.remove('on')
        }
        break

      // !music vol 100
      case 'vol':
        playAudio('/audio/border.wav')

        if (!isNaN(extra) && extra >= 0 && extra <= 100) {
          if (window.player) {
            window.player.setVolume(extra)
          }
        }
        break

      // !music queue
      case 'queue':
        borderCommand()
        playAudio('/audio/border.wav')
        socket.emit('queue', ccsPlaylist)
        break

      // !music default (YouTube URL)
      default:
        if (extra) {
          ccsPlaylist.push(extra)
          localStorage.setItem('ccsPlaylist', JSON.stringify(ccsPlaylist))

          const transitionEl = document.querySelector('.transition')
          if (transitionEl) {
            transitionEl.classList.add('on')
          }

          playAudio('/audio/music.wav')
        }
        break
    }

    setTimeout(() => {
      musicEl.classList.remove('on')
    }, 250)

    setTimeout(() => {
      const transitionEl = document.querySelector('.transition')
      if (transitionEl) {
        transitionEl.classList.remove('on')
      }
    }, 1000)
  })
}
