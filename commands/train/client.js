// Train command handler
export function initTrainCommand(socket) {
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
      audio.play().catch(err => {
        console.warn('Could not play audio (may require user interaction):', err)
      })
    } catch (err) {
      console.error('Error handling train command:', err)
    }
  })
}

