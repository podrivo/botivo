/**
 * Command handler function
 * @param {Object} client - Twitch client instance (tmi.js Client)
 * @param {Object} io - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags with user info (username, display-name, mod, subscriber, badges, etc.)
 * @param {string} message - The full message text that triggered the command
 */

export default function(client, io, channel, tags, message) {

  // You can emit additional events to the overlay
  // This is optional
  io.emit('new-event-first')
  io.emit('new-event-second')
  
  // Send a message to chat
  client.say(channel, `@${tags.username} used ${message}. The is the Twitch chat example message!`)

  // Print log to server
  console.log('▒ !command used: Example message')
  
}
