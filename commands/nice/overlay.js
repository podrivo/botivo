export default function (events) {

  // Get DOM elements
  const niceChars = document.querySelectorAll('.nice .char')

  // Add 'on' class to each character
  // Delay is to match the audio file
  setTimeout(function(){
    niceChars.forEach(char => {
      char.classList.add('on')
      char.addEventListener('transitionend', () => {
        char.classList.remove('on')
      })
    })
  }, 1200)

  // Play audio file
  const audio = new Audio('/commands/nice/assets/nice.wav')
  audio.play()
}
