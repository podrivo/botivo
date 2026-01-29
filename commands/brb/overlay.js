export default function (events) {

  // Get DOM elements
  const borderEl = document.querySelector('.border')
  const brbEl = document.querySelector('.brb span')

  if (!borderEl || !brbEl) {
    console.warn('!brb elements not found')
    return
  }

  // Toggle: if already on, hide; otherwise show
  if (borderEl.classList.contains('on')) {
    borderEl.classList.remove('on')
    brbEl.classList.remove('on')
  } else {
    borderEl.classList.add('on')
    brbEl.classList.add('on')
  }
}
