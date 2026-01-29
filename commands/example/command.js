/**
 * Command handler function
 * @param {Object} twitch - Twitch client instance (tmi.js Client)
 * @param {Object} events - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags with user info (username, display-name, mod, subscriber, badges, etc.)
 * @param {string} message - The full message text that triggered the command
 */

export default function(twitch, events, channel, tags, message) {

  // Send a message to chat
  twitch.say(channel, `@${tags.username} used ${message}. The is the Twitch chat example message!`)

  // Print log to server
  console.log('▒ !example was used. This is a test message.')

  // You can also emit additional events to the overlay
  // This is optional
  events.emit('additional-a')
  events.emit('additional-b')
}
