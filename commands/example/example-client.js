// Example command client-side handler
// This function is called when the overlay loads
// It sets up socket listeners for this command
export function initExampleCommand(socket) {
  // Get DOM element
  let exampleElement = document.querySelector('.example-element')

  if (!exampleElement) {
    console.error('Error: .example-element not found')
    return
  }

  // Listen for the 'example' socket event
  socket.on('example', () => {
    try {
      
      // Simple fade in and scale animation
      anime.animate(exampleElement, {
        opacity: [0, 1],
        marginTop: ['50px', '0px'],
        duration: 600,
        ease: 'outExpo',
        onComplete: () => {
          // Fade out after 2.5 seconds
          setTimeout(() => {
            anime.animate(exampleElement, {
              opacity: [1, 0],
              marginTop: ['0px', '50px'],
              duration: 600,
              ease: 'outExpo',
            })
          }, 2500)
        }
      })
    } catch (err) {
      console.error('Error handling example command:', err)
    }
  })
}

