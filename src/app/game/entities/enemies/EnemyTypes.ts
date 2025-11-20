export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
  SWARMER = 'swarmer',
  SHOOTER = 'shooter',
  CHASER = 'chaser'
}

export interface EnemyConfig {
  health: number;
  speed: number;
  scoreValue: number;
  color: number;
  size: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.BASIC]: {
    health: 1,
    speed: 1.0,
    scoreValue: 100,
    color: 0xff0000,
    size: 0.7
  },
  [EnemyType.FAST]: {
    health: 1,
    speed: 1.5,
    scoreValue: 150,
    color: 0xff4400,
    size: 0.56
  },
  [EnemyType.TANK]: {
    health: 3,
    speed: 0.7,
    scoreValue: 300,
    color: 0x880000,
    size: 0.91
  },
  [EnemyType.SWARMER]: {
    health: 1,
    speed: 1.2,
    scoreValue: 120,
    color: 0xff0088,
    size: 0.42
  },
  [EnemyType.SHOOTER]: {
    health: 2,
    speed: 0.9,
    scoreValue: 200,
    color: 0xff8800,
    size: 0.7
  },
  [EnemyType.CHASER]: {
    health: 1,
    speed: 1.1,
    scoreValue: 180,
    color: 0x00ff00,
    size: 0.7
  }
};

