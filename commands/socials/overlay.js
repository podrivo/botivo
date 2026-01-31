export default function (socket, data) {
  const container = document.querySelector('.socials-overlay')
  if (!container) return

  const listEl = container.querySelector('.socials-list')
  const socials = data && data.socials && typeof data.socials === 'object' ? data.socials : null

  if (!socials || Object.keys(socials).length === 0) {
    container.classList.remove('on')
    return
  }

  if (listEl) {
    listEl.innerHTML = ''
    for (const [label, url] of Object.entries(socials)) {
      if (!url) continue
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.className = 'socials-link'
      a.textContent = label
      listEl.appendChild(a)
    }
  }

  container.classList.add('on')

  anime.animate(container, {
    opacity: [0, 1],
    duration: 400,
    ease: 'outExpo',
    complete: () => {
      const hideAfter = 7000
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
