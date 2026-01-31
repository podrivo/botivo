/**
 * !shape — Update overlay shape (circle/square/rect), position (top/bottom/left/right/center), color, or reset.
 * Returns false so we emit custom payload (cmd or color + value) instead of auto-emit(commandName).
 */
export default function (twitch, events, channel, tags, message) {
  const sayAvailableCommands = 'Available commands: show, hide, square, circle, rect, color, top, bottom, left, right, center, reset'

  const args = message.split(' ')
  const shapeCommand = args[1]

  if (args.length === 1) {
    twitch.say(channel, 'Use \'!shape + cmd\' to update the shape properties in the screen. ' + sayAvailableCommands)
    return false
  }

  if (shapeCommand === 'circle') {
    events.emit('shape', 'circle')
    return false
  }
  if (shapeCommand === 'square') {
    events.emit('shape', 'square')
    return false
  }
  if (shapeCommand === 'rect') {
    events.emit('shape', 'rect')
    return false
  }
  if (shapeCommand === 'top') {
    events.emit('shape', 'top')
    return false
  }
  if (shapeCommand === 'bottom') {
    events.emit('shape', 'bottom')
    return false
  }
  if (shapeCommand === 'left') {
    events.emit('shape', 'left')
    return false
  }
  if (shapeCommand === 'right') {
    events.emit('shape', 'right')
    return false
  }
  if (shapeCommand === 'center') {
    events.emit('shape', 'center')
    return false
  }
  if (shapeCommand === 'reset') {
    events.emit('shape', 'reset')
    return false
  }
  if (shapeCommand === 'hide') {
    events.emit('shape', 'hide')
    return false
  }
  if (shapeCommand === 'show') {
    events.emit('shape', 'show')
    return false
  }
  if (shapeCommand === 'color') {
    if (args.length === 2) {
      twitch.say(channel, 'Usage: !shape color white — Update \'white\' to another color name. You can use whatever HTML colors you\'d like. Make sure to include # in hexadecimals. Check options here: w3schools.com/colors/')
      return false
    }
    const colorCommand = args[2]
    events.emit('shape', 'color', colorCommand)
    return false
  }

  twitch.say(channel, sayAvailableCommands)
  return false
}
