// Rate limiting configuration (in milliseconds)
export const RATE_LIMIT_CONFIG = {
  // Per-user cooldown: how long a user must wait between using any command
  perUserCooldown: 5000, // 5 seconds
  // Global cooldown: minimum time between any command executions (all users)
  globalCooldown: 2000, // 2 seconds
  // Per-command per-user cooldown: how long a user must wait to use the same command again
  perCommandCooldown: 10000 // 10 seconds
}

