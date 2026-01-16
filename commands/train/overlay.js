export default function (socket) {

  // Get DOM element
  let trainList = document.querySelector('.train-list')

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