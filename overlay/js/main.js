window.onload = async function() {

  // Socket.IO
  let socket = io.connect()

  // Socket.IO error handling
  socket.on('connect', () => console.log('Overlay connected to Botivo'))
  socket.on('disconnect', () => console.log('Overlay disconnected from Botivo'))
  socket.on('connect_error', (err) => console.error('Connection error:', err))

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
          const clientModule = await import(`/commands/${htmlFile.command}/client.js`)
          const initFunction = clientModule[`init${htmlFile.command.charAt(0).toUpperCase() + htmlFile.command.slice(1)}Command`] || 
                              clientModule.default || 
                              clientModule.init
          
          if (initFunction && typeof initFunction === 'function') {
            initFunction(socket)
          }
        } catch (importError) {
          console.warn(`No client.js found for ${htmlFile.command}, skipping initialization`)
        }
      } catch (error) {
        console.error(`Error loading ${htmlFile.command} command:`, error)
      }
    }
  } catch (error) {
    console.error('Error fetching command HTML files:', error)
  }
}
