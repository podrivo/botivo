export default function (socket) {

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

  // Grab additional events from command.js
  // This is optional
  socket.on('additional-a',  () => {console.log(`'additional-a' received`)})
  socket.on('additional-b', () => {console.log(`'additional-b' received`)})
}
