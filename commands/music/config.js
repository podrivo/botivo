/**
 * Command Configuration
 * 
 * Active:
 * - active: boolean            // Whether the command is available (defaults to true if not set)
 * 
 * Permissions:
 * - permission: 'broadcaster'  // Only broadcaster
 * - permission: 'moderator'    // Broadcaster and moderators
 * - permission: 'vip'          // Broadcaster, moderators, and VIPs
 * - permission: 'subscriber'   // Broadcaster, moderators, VIPs, and subscribers
 * - permission: 'viewer'       // Everyone (default if not set)
 * 
 * Cooldown:
 * - cooldown: number           // Time in milliseconds (defaults to cooldownGlobal if not set)
 * 
 * Aliases:
 * - alias: string | string[]   // Alternative command names that trigger the same command
 *   Examples:
 *   - alias: 'demo'            // Single alias: !example and !demo both work
 *   - alias: ['demo', 'test']  // Multiple aliases: !demo and !test all work
 */

export const config = {
  cooldown: 0
}
