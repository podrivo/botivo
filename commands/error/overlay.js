let initialized = false

export default function (events) {

  // Get DOM element
  const errorElement = document.querySelector('.error')
  
  if (!errorElement) {
    console.warn('!error element not found')
    return
  }

  // First call (during overlay initialization): do nothing visual/audio,
  // just mark as initialized so subsequent socket events trigger the effect.
  if (!initialized && events) {
    initialized = true
    return
  }

  // Add 'on' class to show the error overlay
  errorElement.classList.add('on')

  // Play error sound
  const audioError = new Audio('/commands/error/error.wav')
  audioError.play().catch(err => {
    console.warn('Could not play !error audio:', err)
  })

  // Remove 'on' class
  setTimeout(() => {
    errorElement.classList.remove('on')
  }, 1500)
}
