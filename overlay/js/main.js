window.onload = async function() {

  // Socket.IO
  let socket = io()

  // Socket.IO error handling
  socket.on('connect', () => console.log('Overlay connected to Events'))
  socket.on('disconnect', () => console.log('Overlay disconnected from Events'))
  socket.on('connect_error', (err) => console.error('Connection error:', err))

  // Listen for command usage logs
  socket.on('command-log', (data) => {
    const logMessage = `Command used: ${data.command} by ${data.username}${data.message.toLowerCase().trim() !== data.command ? ` (${data.message})` : ''}`
    console.log(logMessage)
  })

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
        commandsContainer.appendChild(container)

        // Fetch and inject HTML
        const htmlResponse = await fetch(htmlFile.path)
        const html = await htmlResponse.text()
        container.innerHTML = html

        // Try to dynamically import and initialize the client script
        try {
          const clientModule = await import(`/commands/${htmlFile.command}/overlay.js`)
          
          // Find handler function - try default export first, then named exports
          const handler = clientModule.default || 
                         clientModule.handler || 
                         clientModule.init
          
          if (handler && typeof handler === 'function') {
            // Use handler directly as event handler
            socket.on(htmlFile.command, handler)
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
