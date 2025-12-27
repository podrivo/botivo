window.onload = function() {

  // Socket.IO
  let socket = io.connect()

  // Socket.IO error handling
  socket.on('connect', () => console.log('Overlay connected to Botivo'))
  socket.on('disconnect', () => console.log('Overlay disconnected from Botivo'))
  socket.on('connect_error', (err) => console.error('Connection error:', err))

  // Get DOM element
  let trainList = document.querySelector('.train-list')

  if (!trainList) {
    console.error('Error: .train-list element not found')
    return
  }

  // !train
  socket.on('train', () => {
    try { 
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

      // Play audio with error handling
      const audio = new Audio('../audio/train.wav')
      audio.play().catch(err => {
        console.warn('Could not play audio (may require user interaction):', err)
      })
    } catch (err) {
      console.error('Error handling train command:', err)
    }
  })
}
