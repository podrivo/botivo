export default function (socket, data) {
  const container = document.querySelector('.lurk-overlay')

  const textEl = container.querySelector('.lurk-text')
  const displayName = (data && data.displayName) || (data && data.username) || 'Someone'

  textEl.textContent = `${displayName} is lurking`

  const hideAfter = 8000
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
          ease: 'inQuint',
        })
      }, hideAfter)
    }
  })
}
