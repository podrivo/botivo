export default function (socket, data) {
  const container = document.querySelector('.love-overlay')
  if (!container) return

  const nameEl = container.querySelector('.love-name')
  const displayName = (data && data.displayName) || (data && data.username) || 'Someone'

  if (nameEl) {
    nameEl.textContent = displayName
  }

  container.classList.add('on')

  anime.animate(container, {
    opacity: [0, 1],
    duration: 500,
    ease: 'outExpo',
    complete: () => {
      const hideAfter = 3500
      const fadeOut = 500
      setTimeout(() => {
        anime.animate(container, {
          opacity: [1, 0],
          duration: fadeOut,
          ease: 'inExpo',
          complete: () => {
            container.classList.remove('on')
          }
        })
      }, hideAfter)
    }
  })
}
