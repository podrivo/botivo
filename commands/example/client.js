// Example command client-side handler
// This function is automatically called when the 'example' socket event fires.
// No need to manually set up socket.on('example', ...) - it's done automatically!
//
// Note: You can also export a function named 'init' or use the old naming pattern
//       (initExampleCommand) if you prefer, but default export is simplest.

export default function() {

  // Get DOM element
  let element = document.querySelector('.example-element')

  // Simple fade in and scale animation
  anime.animate(element, {
    opacity: [0, 1],
    marginTop: ['50px', '0px'],
    duration: 600,
    ease: 'outExpo',
    onComplete: () => {
      // Fade out after 2.5 seconds
      setTimeout(() => {
        anime.animate(element, {
          opacity: [1, 0],
          marginTop: ['0px', '50px'],
          duration: 600,
          ease: 'outExpo',
        })
      }, 2500)
    }
  })
}

