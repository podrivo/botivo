let initialized = false

export default function (events) {

  // Get DOM element
  let trainList = document.querySelector('.train-list')

  if (!trainList) {
    console.warn('train overlay: .train-list not found')
    return
  }

  // First call (during overlay initialization): do nothing visual/audio,
  // just mark as initialized so subsequent socket events trigger the effect.
  if (!initialized && events) {
    initialized = true
    return
  }

  // Reset style and set new
  trainList.removeAttribute('style')
  trainList.style.top = Math.floor(Math.random() * (screen.height * 0.5)) + 'px'

  // Animation
  let animation = anime.animate(trainList, {
    translateX: '-6000px',
    ease: 'linear',
    duration: 10000,
    autoplay: false
  })
  animation.restart()
  animation.resume()

  // Play audio with error handling
  const audio = new Audio('/commands/train/train.wav')
  audio.play()
}