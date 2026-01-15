// Parameters:
//   - client: Twitch client instance
//   - io: Socket.IO server instance
//   - channel: Twitch channel name
//   - tags: Message tags (includes username, etc.)
//   - message: The full message text

export default function(client, io, channel, tags, message) {

  // Send a message chat
  client.say(process.env.TWITCH_CHANNEL, `@${tags.username}, hop on! Train is about to leave!`)
}

// Configs
export const config = {
  cooldown: 1000,
  // level: 'broadcaster'  // Only broadcaster can use
  // level: 'moderator'    // Broadcaster and moderators can use
  // level: 'vip'          // Broadcaster, moderators, and VIPs can use
  // level: 'subscriber'   // Broadcaster, moderators, VIPs, and subscribers can use
  // level: 'viewer'       // Everyone can use (default if not set)
}