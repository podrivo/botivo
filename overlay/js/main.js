window.onload = async function() {

  // Socket.IO
  let socket = io()

  // Socket.IO error handling
  socket.on('connect', () => console.log('Overlay connected to Events'))
  socket.on('disconnect', () => console.log('Overlay disconnected from Events'))
  socket.on('connect_error', (err) => console.error('Connection error:', err))

  // Store original HTML content for each command container (for restoration after kill)
  const commandHtmlStorage = new Map() // Map<commandName, htmlContent>
  
  // Track all Audio instances to stop them on kill-all
  const activeAudioInstances = new Set() // Set<Audio>

  // Override Audio constructor to track instances
  const OriginalAudio = window.Audio
  window.Audio = function(...args) {
    const audio = new OriginalAudio(...args)
    activeAudioInstances.add(audio)
    
    // Remove from set when audio ends or is stopped
    audio.addEventListener('ended', () => activeAudioInstances.delete(audio))
    audio.addEventListener('pause', () => {
      // Only remove if paused and currentTime is 0 (fully stopped)
      if (audio.currentTime === 0) {
        activeAudioInstances.delete(audio)
      }
    })
    
    return audio
  }

  // Listen for command usage logs
  socket.on('command-log', (data) => {
    const logMessage = `Command used: ${data.command} by ${data.username}${data.message.toLowerCase().trim() !== data.command ? ` (${data.message})` : ''}`
    console.log(logMessage)
  })

  // Function to stop all running commands
  function stopAllCommands() {
    console.log('Kill event received: Stopping all commands')
    
    // Stop all tracked Audio instances (created with new Audio())
    activeAudioInstances.forEach(audio => {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch (e) {
        // Ignore errors (audio might already be stopped)
      }
    })
    activeAudioInstances.clear()
    
    // Stop all HTML audio elements
    const allAudioElements = document.querySelectorAll('audio')
    allAudioElements.forEach(audio => {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch (e) {
        // Ignore errors
      }
    })
    
    // Clear all command containers (HTML is already stored from initial load)
    // When elements are removed from DOM, anime.js animations automatically stop
    const commandsContainer = document.getElementById('commands-container')
    if (commandsContainer) {
      const containers = commandsContainer.querySelectorAll('[id$="-container"]')
      containers.forEach(container => {
        // Clear the container (original HTML is already stored in commandHtmlStorage)
        container.innerHTML = ''
        container.removeAttribute('style')
      })
    }
  }

  // Listen for kill event (auto-emitted by command system)
  socket.on('kill', stopAllCommands)

  // Helper function to restore HTML for a command if it was cleared
  function restoreCommandHtml(commandName) {
    const containerId = `${commandName}-container`
    const container = document.getElementById(containerId)
    if (container && !container.innerHTML.trim() && commandHtmlStorage.has(commandName)) {
      container.innerHTML = commandHtmlStorage.get(commandName)
      return true
    }
    return false
  }

  // Helper function to find handler in a module
  function findHandler(module) {
    return module.default || module.handler || module.init
  }

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

        // Store the HTML content for this command (for restoration after kill)
        commandHtmlStorage.set(htmlFile.command, html)

        // Try to dynamically import and initialize the client script
        try {
          const clientModule = await import(`/commands/${htmlFile.command}/overlay.js`)
          
          // Find handler function
          const handler = findHandler(clientModule)
          
          if (handler && typeof handler === 'function') {
            // Track which socket events have been set up to prevent duplicate listeners
            const initializedEvents = new Set()
            
            // Check if handler accepts parameters (indicates it wants socket for listener setup)
            const handlerLength = handler.length
            
            if (handlerLength > 0) {
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
              
              // Call handler during initialization to set up event listeners
              // Animation and audio won't run because they're disabled
              handler(socket)
              
              // Restore original functions
              socket.on = originalSocketOn
              if (window.anime && originalAnimeAnimate) {
                window.anime.animate = originalAnimeAnimate
              }
              if (currentAudio) {
                window.Audio = currentAudio
              }
            }
            
            // Wrap handler to restore HTML if it was cleared by kill-all and prevent duplicate listeners
            const wrappedHandler = function() {
              // Restore HTML if container was cleared
              restoreCommandHtml(htmlFile.command)
              
              if (handlerLength > 0) {
                // For handlers with socket parameter, wrap socket.on to prevent duplicate listeners
                const originalSocketOn = socket.on.bind(socket)
                socket.on = createSocketWrapper(originalSocketOn, initializedEvents)
                
                // Execute the handler (listeners already set up, command logic will run)
                handler(socket, ...arguments)
                
                // Restore original socket.on after handler execution
                socket.on = originalSocketOn
              } else {
                // For handlers without parameters, just call normally
                handler(...arguments)
              }
            }
            // Use wrapped handler as event handler
            socket.on(htmlFile.command, wrappedHandler)
          }
        } catch (importError) {
          // No client file found - that's okay, command might not need client-side logic
          console.warn(`No overlay.js found for ${htmlFile.command}, skipping client initialization`)
          // Still register a handler to restore HTML if it was cleared
          socket.on(htmlFile.command, () => {
            restoreCommandHtml(htmlFile.command)
          })
        }
      } catch (error) {
        console.error(`Error loading ${htmlFile.command} command:`, error)
      }
    }
  } catch (error) {
    console.error('Error fetching command HTML files:', error)
  }
}
