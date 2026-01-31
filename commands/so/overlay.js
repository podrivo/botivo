export default function (socket, data) {
  const container = document.querySelector('.so-overlay')
  if (!container) return

  const textEl = container.querySelector('.so-text')
  const linkEl = container.querySelector('.so-link')
  const targetChannel = data && (data.displayName || data.targetChannel)
  const targetLower = data && data.targetChannel

  if (!targetChannel) {
    container.classList.remove('on')
    return
  }

  if (textEl) {
    textEl.textContent = `Shoutout to @${targetChannel}!`
  }
  if (linkEl && targetLower) {
    linkEl.href = `https://twitch.tv/${targetLower}`
    linkEl.textContent = `twitch.tv/${targetLower}`
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
