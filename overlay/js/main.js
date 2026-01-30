window.onload = async function() {

  // Track Anime.js animations so !kill can call .reset() on them (like commands/train/overlay.js)
  window.__animeKillRestartList = []
  if (window.anime && typeof window.anime.animate === 'function') {
    const originalAnimate = window.anime.animate.bind(window.anime)
    window.anime.animate = function (...args) {
      const anim = originalAnimate(...args)
      if (anim && typeof anim.reset === 'function') window.__animeKillRestartList.push(anim)
      return anim
    }
  }

  // Socket.IO
  let socket = io()

  // Socket.IO error handling
  socket.on('connect', () => console.log('Overlay connected to Events'))
  socket.on('disconnect', () => console.log('Overlay disconnected from Events'))
  socket.on('connect_error', (err) => console.error('Connection error:', err))

  // Track all Audio instances to stop them on !kill (new Audio() does not create a DOM element)
  const activeAudioInstances = new Set() // Set<Audio>

  const OriginalAudio = window.Audio
  window.Audio = function(...args) {
    const audio = new OriginalAudio(...args)
    activeAudioInstances.add(audio)
    audio.addEventListener('ended', () => activeAudioInstances.delete(audio))
    audio.addEventListener('pause', () => {
      if (audio.currentTime === 0) activeAudioInstances.delete(audio)
    })
    return audio
  }

  // Listen for command usage logs
  socket.on('command-log', (data) => {
    const logMessage = `Command used: ${data.command} by ${data.username}${data.message.toLowerCase().trim() !== data.command ? ` (${data.message})` : ''}`
    console.log(logMessage)
  })

  // !kill handler: pause and reset audio, video, animations, transitions (no DOM removal).
  // Triggered by app/commands.js default command which emits 'kill'.
  function stopAllCommands() {
    console.log('Kill event received: Pausing and resetting media and animations')

    // YouTube IFrame player (commands/youtube sets window.player; not an HTML <video>)
    if (window.player && typeof window.player.stopVideo === 'function') {
      try {
        window.player.stopVideo()
      } catch (e) { /* ignore */ }
    }

    // Audio: tracked instances (new Audio()) and <audio> elements
    activeAudioInstances.forEach(audio => {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch (e) { /* ignore */ }
    })
    activeAudioInstances.clear()
    document.querySelectorAll('audio').forEach(audio => {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch (e) { /* ignore */ }
    })

    // Video: pause and reset (native <video>; YouTube uses window.player above)
    document.querySelectorAll('video').forEach(video => {
      try {
        video.pause()
        video.currentTime = 0
      } catch (e) { /* ignore */ }
    })

    // Anime.js: reset all tracked animations (like animation.reset() in commands/train/overlay.js)
    if (window.__animeKillRestartList) {
      window.__animeKillRestartList.forEach(anim => {
        try {
          if (anim && typeof anim.reset === 'function') anim.reset()
        } catch (e) { /* ignore */ }
      })
    }

    // CSS: pause animations and transitions, then remove inline styles so elements stay clean
    const root = document.getElementById('commands-container')
    if (root) {
      const all = [root, ...root.querySelectorAll('*')]
      all.forEach(el => {
        el.style.animationPlayState = 'paused'
        el.style.transition = 'none'
      })
      all.forEach(el => {
        el.style.removeProperty('animation-play-state')
        el.style.removeProperty('transition')
      })
    }
  }

  socket.on('kill', stopAllCommands)

  // Helper function to create socket wrapper that prevents duplicate listeners
  function createSocketWrapper(originalSocketOn, initializedEvents) {
    return function(eventName, callback) {
      const eventKey = eventName
      if (!initializedEvents.has(eventKey)) {
        initializedEvents.add(eventKey)
        originalSocketOn(eventName, callback)
      }
    }
  }

  // Auto-discover and inject command HTML files
  try {
    // Get list of available command HTML files (injected by server)
    const htmlFiles = window.COMMAND_HTML_FILES || []
    // console.log('Found command HTML files:', htmlFiles)

    const commandsContainer = document.getElementById('commands-container')
    
    if (!commandsContainer) {
      console.error('Error: commands-container element not found')
      return
    }

    // Inject each HTML file and initialize its client script
    for (const htmlFile of htmlFiles) {
      try {
        // Create container for this command
        const container = document.createElement('div')
        container.id = htmlFile.containerId
        container.setAttribute('data-initializing', 'true')
        commandsContainer.appendChild(container)

        // Fetch and inject HTML
        const htmlResponse = await fetch(htmlFile.path)
        const html = await htmlResponse.text()
        container.innerHTML = html

        // Try to dynamically import and initialize the client script
        try {
          const clientModule = await import(`/commands/${htmlFile.command}/overlay.js`)
          
          // New lifecycle:
          // - Optional: module.init(events) is called once during initialization
          //   with animations/audio disabled and socket.on wrapped to avoid
          //   duplicate listeners.
          // - Required for commands with overlay logic:
          //   module.default(events, ...args) is called on each command event.
          const initHandler = typeof clientModule.init === 'function'
            ? clientModule.init
            : null
          const commandHandler = (clientModule.default || clientModule.handler)
          const hasCommandHandler = typeof commandHandler === 'function'
          
          // Track which socket events have been set up to prevent duplicate listeners
          const initializedEvents = new Set()
          
          // Run optional init handler once during overlay initialization
          if (initHandler) {
            // Wrap socket.on to prevent duplicate event listeners
            const originalSocketOn = socket.on.bind(socket)
            socket.on = createSocketWrapper(originalSocketOn, initializedEvents)
            
            // Temporarily disable animations and audio during initialization
            const originalAnimeAnimate = window.anime?.animate
            if (window.anime && originalAnimeAnimate) {
              window.anime.animate = function() {
                // Return a no-op animation object during initialization
                return {
                  onComplete: function(fn) { return this },
                  restart: function() { return this },
                  resume: function() { return this },
                  pause: function() { return this },
                  seek: function() { return this }
                }
              }
            }
            
            // Temporarily disable Audio playback during initialization
            // Save the current Audio (which may already be overridden for tracking)
            const currentAudio = window.Audio
            if (currentAudio) {
              window.Audio = function(...args) {
                const audio = new currentAudio(...args)
                // Override play() to be a no-op during initialization
                const originalPlay = audio.play.bind(audio)
                audio.play = function() {
                  // Return a resolved promise to prevent errors
                  return Promise.resolve()
                }
                return audio
              }
            }
            
            // Call init handler to set up event listeners or other one-time logic.
            // Animation and audio won't run because they're disabled.
            initHandler(socket)
            
            // Restore original functions
            socket.on = originalSocketOn
            if (window.anime && originalAnimeAnimate) {
              window.anime.animate = originalAnimeAnimate
            }
            if (currentAudio) {
              window.Audio = currentAudio
            }
          }
          
          if (hasCommandHandler) {
            // Wrap command handler to prevent duplicate listeners when using events.on.
            const wrappedHandler = function() {
              // For handlers that use events.on, wrap socket.on to prevent
              // duplicate listeners (reusing the same initializedEvents set).
              const originalSocketOn = socket.on.bind(socket)
              socket.on = createSocketWrapper(originalSocketOn, initializedEvents)
              
              // Execute the command handler. The first argument is always the
              // events/socket object, followed by any additional payload.
              commandHandler(socket, ...arguments)
              
              // Restore original socket.on after handler execution
              socket.on = originalSocketOn
            }
            
            // Use wrapped handler as event handler for this command
            socket.on(htmlFile.command, wrappedHandler)
          }
        } catch (importError) {
          // No client file found - that's okay, command might not need client-side logic
          console.warn(`No overlay.js found for ${htmlFile.command}, skipping client initialization`)
        }
      } catch (error) {
        console.error(`Error loading ${htmlFile.command} command:`, error)
      }
    }
  } catch (error) {
    console.error('Error fetching command HTML files:', error)
  }
}
