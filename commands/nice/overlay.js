export default function () {

  // Get DOM element
  const niceChars = document.querySelectorAll('.nice .char')

  setTimeout(function () {
    niceChars.forEach(char => {
      char.classList.add('on')
      char.addEventListener('animationend', () => {
        char.classList.remove('on')
      })
    })
  }, 600)

  const audio = new Audio('/commands/nice/assets/nice.wav')
  audio.play()
}
