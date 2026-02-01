export default function (socket, data) {

  // Get DOM elements
  const container = document.querySelector('.love-overlay')
  const nameEl = container.querySelector('.love-name')
  const displayName = (data && data.displayName) || (data && data.username) || 'Someone'

  const hideAfter = 3500
  const fade = 500

  if (nameEl) {
    nameEl.textContent = displayName
  }

  container.classList.add('on')

  anime.animate(container, {
    opacity: [0, 1],
    duration: fade,
    ease: 'outQuint',
    complete: () => {
      
      setTimeout(() => {
        anime.animate(container, {
          opacity: [1, 0],
          duration: fade,
          ease: 'inQuint',
          complete: () => {
            container.classList.remove('on')
          }
        })
      }, hideAfter)
    }
  })
}
