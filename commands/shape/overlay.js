let timeoutShape
let timeoutColor

export default function (socket, cmd, subCmd) {
  const container = document.getElementById('shape-container')
  const chatShape = container && container.querySelector('.chat-shape')
  if (!chatShape) return

  const shapeSize = chatShape.offsetWidth
  const shapeSizeHalf = shapeSize / 2

  // shapes
  ;['circle', 'square', 'rect'].forEach((shape) => {
    if (cmd === shape && !chatShape.classList.contains(cmd)) {
      chatShape.className = 'chat-shape ' + shape

      window.clearTimeout(timeoutShape)
      timeoutShape = window.setTimeout(function () {
        chatShape.className = 'chat-shape circle'
      }, 1200000)
    }
  })

  // colors
  if (cmd === 'color' && !chatShape.classList.contains(cmd)) {
    chatShape.style.background = subCmd

    window.clearTimeout(timeoutColor)
    timeoutColor = window.setTimeout(function () {
      chatShape.style.background = 'white'
    }, 1200000)
  }

  // top
  if (cmd === 'top' && !chatShape.classList.contains(cmd)) {
    chatShape.style.top = '40px'
    chatShape.style.left = 'calc(50% - ' + shapeSizeHalf + 'px)'
    chatShape.style.transformOrigin = 'top center'

    window.clearTimeout(timeoutColor)
    timeoutColor = window.setTimeout(function () {
      chatShape.style.top = 'calc(100% - ' + shapeSize + 'px - 40px)'
      chatShape.style.left = 'calc(50% - ' + shapeSizeHalf + 'px)'
      chatShape.style.transformOrigin = 'bottom center'
    }, 1200000)
  }

  // bottom
  if (cmd === 'bottom' && !chatShape.classList.contains(cmd)) {
    chatShape.style.top = 'calc(100% - ' + shapeSize + 'px - 40px)'
    chatShape.style.left = 'calc(50% - ' + shapeSizeHalf + 'px)'
    chatShape.style.transformOrigin = 'bottom center'
  }

  // left
  if (cmd === 'left' && !chatShape.classList.contains(cmd)) {
    chatShape.style.top = 'calc(50% - ' + shapeSizeHalf + 'px)'
    chatShape.style.left = '40px'
    chatShape.style.transformOrigin = 'center left'

    window.clearTimeout(timeoutColor)
    timeoutColor = window.setTimeout(() => {
      chatShape.style.top = 'calc(100% - ' + shapeSize + 'px - 40px)'
      chatShape.style.left = 'calc(50% - ' + shapeSizeHalf + 'px)'
      chatShape.style.transformOrigin = 'bottom center'
    }, 1200000)
  }

  // right
  if (cmd === 'right' && !chatShape.classList.contains(cmd)) {
    chatShape.style.top = 'calc(50% - ' + shapeSizeHalf + 'px)'
    chatShape.style.left = 'calc(100% - ' + shapeSize + 'px - 40px)'
    chatShape.style.transformOrigin = 'center right'

    window.clearTimeout(timeoutColor)
    timeoutColor = window.setTimeout(() => {
      chatShape.style.top = 'calc(100% - ' + shapeSize + 'px - 40px)'
      chatShape.style.left = 'calc(50% - ' + shapeSizeHalf + 'px)'
      chatShape.style.transformOrigin = 'bottom center'
    }, 1200000)
  }

  // center
  if (cmd === 'center' && !chatShape.classList.contains(cmd)) {
    chatShape.style.top = 'calc(50% - ' + shapeSizeHalf + 'px)'
    chatShape.style.left = 'calc(50% - ' + shapeSizeHalf + 'px)'
    chatShape.style.transformOrigin = 'center center'

    window.clearTimeout(timeoutColor)
    timeoutColor = window.setTimeout(() => {
      chatShape.style.top = 'calc(100% - ' + shapeSize + 'px - 40px)'
      chatShape.style.left = 'calc(50% - ' + shapeSizeHalf + 'px)'
      chatShape.style.transformOrigin = 'bottom center'
    }, 1200000)
  }

  // reset
  if (cmd === 'reset' && !chatShape.classList.contains(cmd)) {
    chatShape.className = 'chat-shape circle'
    chatShape.style.background = 'pink'
    chatShape.style.top = 'calc(100% - ' + shapeSize + 'px - 40px)'
    chatShape.style.left = 'calc(50% - ' + shapeSizeHalf + 'px)'
    chatShape.style.transformOrigin = 'bottom center'
  }
}
