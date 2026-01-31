export default function (socket, data) {
  const container = document.querySelector('.lurk-overlay')
  if (!container) return

  const textEl = container.querySelector('.lurk-text')
  const displayName = (data && data.displayName) || (data && data.username) || 'Someone'

  if (textEl) {
    textEl.textContent = `${displayName} is lurking`
  }

  container.classList.add('on')

  anime.animate(container, {
    opacity: [0, 1],
    duration: 500,
    ease: 'outExpo',
    complete: () => {
      const hideAfter = 8000
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
