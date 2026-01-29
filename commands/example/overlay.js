export default function (events) {

  // Get DOM element
  let element = document.querySelector('.example-element')
  
  if (!element) {
    console.warn('example overlay: .example-element not found')
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

// Grab additional events from command.js
// This is optional
export function init(events) {
  events.on('example-additional-a', () => { console.log(`'example-additional-a' received`) })
  events.on('example-additional-b', () => { console.log(`'example-additional-b' received`) })
}