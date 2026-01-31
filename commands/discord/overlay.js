export default function (socket, data) {
  const container = document.querySelector('.discord-overlay')
  if (!container) return

  const textEl = container.querySelector('.discord-text')
  const linkEl = container.querySelector('.discord-link')
  const url = data && data.discordUrl

  if (!url) {
    container.classList.remove('on')
    return
  }

  if (linkEl) {
    linkEl.href = url
    linkEl.textContent = url
  }

  container.classList.add('on')

  anime.animate(container, {
    opacity: [0, 1],
    duration: 400,
    ease: 'outExpo',
    complete: () => {
      const hideAfter = 6000
      const fadeOut = 400
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
