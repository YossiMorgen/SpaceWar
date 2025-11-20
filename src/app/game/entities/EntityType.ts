export enum EntityType {
  ENEMY = 'enemy',
  POWERUP = 'powerup',
  COLLECTIBLE = 'collectible',
  PROJECTILE = 'projectile'
}

export interface EntityMetadata {
  type: EntityType;
  [key: string]: any;
}

