let initialized = false

export default function (events) {

  // Get DOM elements - all character elements
  const niceChars = document.querySelectorAll('.nice .char')

  // First call (during overlay initialization): do nothing visual/audio,
  // just mark as initialized so subsequent socket events trigger the effect.
  if (!initialized && events) {
    initialized = true
    return
  }

  // Add 'on' class to each character after delay
  setTimeout(function(){
    niceChars.forEach(char => {
      char.classList.add('on')
      char.addEventListener('transitionend', () => {
        char.classList.remove('on')
      })
    })
  }, 1200)

  // Play audio file
  const audio = new Audio('/commands/nice/nice.wav')
  audio.play()
}
