// List of wow audio files
const WOW_AUDIOS = [
  '/commands/wow/assets/wow-01.wav',
  '/commands/wow/assets/wow-02.wav',
  '/commands/wow/assets/wow-03.wav',
  '/commands/wow/assets/wow-04.wav'
]

export default function (events) {

  // Get DOM element
  const element = document.querySelector('.wow span')

  // Add 'on' class to show the wow overlay
  setTimeout(() => {
    element.classList.add('on')
    element.addEventListener('animationend', () => {
      element.classList.remove('on')
    })
  }, 600)

  // Play random audio
  const audio = new Audio(WOW_AUDIOS[Math.floor(Math.random() * WOW_AUDIOS.length)])
  audio.play()
}
