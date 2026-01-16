/**
 * Command Configuration
 * 
 * Permission Levels:
 * - level: 'broadcaster'       // Only broadcaster can use
 * - level: 'moderator'         // Broadcaster and moderators can use
 * - level: 'vip'               // Broadcaster, moderators, and VIPs can use
 * - level: 'subscriber'        // Broadcaster, moderators, VIPs, and subscribers can use
 * - level: 'viewer'            // Everyone can use (default if not set)
 * 
 * Cooldown:
 * - cooldown: number           // Time in milliseconds before the command can be used again (defaults to cooldownGlobal if not set)
 * 
 * Aliases:
 * - alias: string | string[]   // Alternative command names that trigger the same command
 *   Examples:
 *   - alias: 'demo'            // Single alias: !example and !demo both work
 *   - alias: ['demo', 'test']  // Multiple aliases: !demo and !test all work
 */

export const config = {
  cooldown: 5000,
  alias: 'demo'
}
