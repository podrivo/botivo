const WOW_AUDIOS = [
  '/commands/wow/assets/wow-01.wav',
  '/commands/wow/assets/wow-02.wav',
  '/commands/wow/assets/wow-03.wav',
  '/commands/wow/assets/wow-04.wav'
]

export default function (events) {
  const element = document.querySelector('#wow-container .wow')

  setTimeout(() => {
    element.classList.add('on')
    element.addEventListener('transitionend', () => {
      element.classList.remove('on')
    }, { once: true })
  }, 600)

  const audio = new Audio(array[Math.floor(Math.random() * array.length)](WOW_AUDIOS))
  audio.play()
}
