/**
 * Nice Command Handler
 * 
 * Handles !nice command - displays "NICE" animation and plays audio.
 * 
 * @param {Object} client - Twitch client instance (tmi.js Client)
 * @param {Object} io - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags with user info (username, display-name, mod, subscriber, badges, etc.)
 * @param {string} message - The full message text that triggered the command
 */

export default function(client, io, channel, tags, message) {
  
  // Send chat message
  client.say(channel, 'Nice! GlitchCat')

}
