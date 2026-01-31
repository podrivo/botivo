export default function (socket) {
  const container = document.querySelector('.discord-box')

  const hideAfter = 6000
  const fade = 800

  anime.animate(container, {
    opacity: [0, 1],
    bottom: '-40px',
    duration: fade,
    ease: 'outQuint',
    complete: () => {


      setTimeout(() => {
        anime.animate(container, {
          opacity: [1, 0],
          translateY: '40px',
          duration: fade,
          ease: 'inQuint'
        })
      }, hideAfter)
    }
  })
}
