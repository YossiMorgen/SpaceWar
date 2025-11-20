export enum PowerUpType {
  SHIELD = 'shield',
  RAPID_FIRE = 'rapid_fire',
  MULTI_SHOT = 'multi_shot',
  SPEED_BOOST = 'speed_boost',
  MAGNET = 'magnet',
  SCORE_MULTIPLIER = 'score_multiplier',
  HEALTH = 'health'
}

export interface PowerUpConfig {
  duration: number;
  color: number;
  icon: string;
}

export const POWERUP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  [PowerUpType.SHIELD]: {
    duration: 10.0,
    color: 0x0088ff,
    icon: '🛡️'
  },
  [PowerUpType.RAPID_FIRE]: {
    duration: 8.0,
    color: 0xff0088,
    icon: '⚡'
  },
  [PowerUpType.MULTI_SHOT]: {
    duration: 10.0,
    color: 0x00ff88,
    icon: '💥'
  },
  [PowerUpType.SPEED_BOOST]: {
    duration: 6.0,
    color: 0xffff00,
    icon: '🚀'
  },
  [PowerUpType.MAGNET]: {
    duration: 12.0,
    color: 0xff8800,
    icon: '🧲'
  },
  [PowerUpType.SCORE_MULTIPLIER]: {
    duration: 15.0,
    color: 0x8800ff,
    icon: '⭐'
  },
  [PowerUpType.HEALTH]: {
    duration: 0,
    color: 0x00ff00,
    icon: '❤️'
  }
};

