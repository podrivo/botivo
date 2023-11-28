window.onload = function() {

  // Socket.IO
  let socket = io.connect()

  // Get DOM element
  let trainList = document.querySelector('.train-list')

  // !train
  socket.on('train', () => {

    // Reset style and set new
    trainList.removeAttribute('style')
    trainList.style.top = Math.floor(Math.random() * (screen.height * 0.5)) + 'px'

    // Animation
    let animation = anime({
      targets: trainList,
      translateX: '-6000px',
      easing: 'linear',
      duration: 10000,
      autoplay: false
    })
    animation.restart()
    animation.play()

    // Play audio
    const audio = new Audio('../audio/train.wav')
    audio.play()
  })
}
