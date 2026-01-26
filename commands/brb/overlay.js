/**
 * BRB Command Overlay Handler
 * 
 * Handles the brb command overlay animation.
 * When !brb is triggered, shows a rainbow border and "BRB" text.
 * When !back is triggered, hides the border and text.
 */

// Track if listeners are set up (module-level to persist across calls)
let listenersSetup = false

export default function (socket) {
  // Get DOM elements
  const borderEl = document.querySelector('.border')
  const brbEl = document.querySelector('.brb span')
  
  if (!borderEl || !brbEl) {
    console.warn('!brb elements not found')
    return
  }
  
  // Set up 'back' listener only once during initialization
  if (!listenersSetup && socket) {
    socket.on('back', () => {
      borderEl.classList.remove('on')
      brbEl.classList.remove('on')
    })
    listenersSetup = true
    // Don't show border/text during initialization
    return
  }
  
  // Handle !brb command - show border and text
  // This runs when 'brb' event is received (after initialization)
  borderEl.classList.add('on')
  brbEl.classList.add('on')
}
