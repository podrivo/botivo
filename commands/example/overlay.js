let initialized = false

export default function (events) {

  // Get DOM element
  let element = document.querySelector('.example-element')

  if (!element) {
    console.warn('example overlay: .example-element not found')
    return
  }

  // First call (during overlay initialization): set up listeners only
  if (!initialized && events) {
    // Grab additional events from command.js (optional)
    events.on('additional-a', () => {
      console.log(`'additional-a' received`)
    })
    events.on('additional-b', () => {
      console.log(`'additional-b' received`)
    })

    initialized = true
    return
  }

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
