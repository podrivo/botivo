/**
 * Command handler function
 * 
 * @param {Object} client - Twitch client instance (tmi.js Client)
 * @param {Object} io - Socket.IO server instance for emitting events to overlay
 * @param {string} channel - Twitch channel name where the command was triggered
 * @param {Object} tags - Message tags object from Twitch IRC containing user and message metadata:
 * 
 *   User Identity:
 *   - username: User's login name (lowercase)
 *   - display-name: User's display name (case preserved, may differ from username)
 *   - 'user-id': Twitch user's unique numeric ID
 *   - 'room-id': Numeric ID of the channel/chat room
 *   - color: Hexadecimal RGB color code for username in chat (e.g., "#FF0000")
 * 
 *   User Roles & Status:
 *   - mod: Boolean indicating if user is a moderator in this channel
 *   - subscriber: Boolean indicating if user is a subscriber
 *   - vip: Present when user has VIP status (may be undefined if not VIP)
 *   - 'user-type': User role (empty, "staff", "global_mod", or "admin")
 *   - badges: Object with badge identifiers and versions:
 *     * badges.broadcaster: "1" if user is the channel broadcaster
 *     * badges.moderator: "1" if user is a moderator
 *     * badges.vip: "1" if user has VIP status
 *     * badges.subscriber: Subscriber badge version (e.g., "6" for 6 months)
 *     * Additional badges may include: bits, partner, premium, etc.
 * 
 *   Message Metadata:
 *   - id: UUID that uniquely identifies the message
 *   - 'tmi-sent-ts': Timestamp when Twitch received the message (UNIX milliseconds)
 *   - 'first-msg': Boolean indicating if this was the user's first message in the channel
 * 
 *   Emotes:
 *   - emotes: Data specifying emote positions in the message for rendering
 *   - 'emote-sets': Array/list of emote set IDs the user has access to
 * 
 * @param {string} message - The full message text that triggered the command
 * 
 * @returns {boolean|undefined} - Return `false` to prevent automatic socket emission to overlay.
 *                                Otherwise, the command name will be automatically emitted as a socket event.
 */

export default function(client, io, channel, tags, message) {
  
  // Send a message chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, example command executed!`)
  
}
