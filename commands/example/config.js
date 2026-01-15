/**
 * Command Configuration
 * 
 * Permission Levels:
 * - level: 'broadcaster'  // Only broadcaster can use
 * - level: 'moderator'    // Broadcaster and moderators can use
 * - level: 'vip'          // Broadcaster, moderators, and VIPs can use
 * - level: 'subscriber'   // Broadcaster, moderators, VIPs, and subscribers can use
 * - level: 'viewer'       // Everyone can use (default if not set)
 * 
 * Cooldown:
 * - cooldown: number      // Time in milliseconds before the command can be used again (defaults to cooldownGlobal if not set)
 */

export const config = {
  cooldown: 5000,
}
