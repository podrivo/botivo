export default function (socket) {

  // Get DOM elements
  const container = document.querySelector('.love-overlay')

  const hideAfter = 3500
  const fade = 500

  anime.animate(container, {
    opacity: [0, 1],
    duration: fade,
    ease: 'outQuint',
    complete: () => {
      
      setTimeout(() => {
        anime.animate(container, {
          opacity: [1, 0],
          duration: fade,
          ease: 'inQuint'
        })
      }, hideAfter)
    }
  })
}
