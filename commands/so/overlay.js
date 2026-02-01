export default function (socket, data) {

  // Get DOM elements
  const container = document.querySelector('.so-overlay')
  const textEl = container.querySelector('.so-text')
  const targetChannel = data && (data.displayName || data.targetChannel)

  // Set text content
  textEl.textContent = `Shoutout to @${targetChannel}!`

  // Set animation duration and ease
  const hideAfter = 6000
  const fade = 400

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
